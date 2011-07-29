/**
* Application handling for Matrix GUI
* @author Thomas Potthast <tpotthast@ti.com> 
* @fileOverview
*/
/**
* Application execution and output capture 
* @name apps
* @class 
*/
/**
* Public methods of apps
* @name exports
* @memberOf apps
*/
var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    cp = require('child_process'),
    mUtils = require("./matrixutils.js"),
    configs = require("./configs.js");

/**
* Executes an app. Output is captured and initial status is sent in respnse
* @private
* @param app Application object to execute
* @param lockPath Path to the application lock file. It is presumed to have
* been created beforehand and is deleted after.
* @param response HTTP response object. It is used to send information (in 
* JSON) about the application run and output location.
* @see mUtils.exports.randomString
* @see mUtils.exports.getAppOutputFilename
* @see apps.exports.launchApp
* @memberOf apps
*/
var executeApp = function(app, lockPath, response){
	var id = mUtils.randomString(configs.appRunIdLength);
	var outFileName = mUtils.getAppOutputFilename(id);
	var isRunningFile = mUtils.getRunningFilename(id);
	var output = fs.createWriteStream(outFileName, {'flags' : 'a'});

	fs.writeFile(isRunningFile, "running", function(err){
		if(err){
			console.log("Could not write running status file. Refreshes may not be accurate");
		}
		var split = app.appName.split(" ");
		var executable = split[0];
		var options = [];
		if(split.length > 1){
			options = split.slice (1);
		}
		var proc = cp.spawn(executable, options);
		proc.stdout.on('data', function(data){
			var c = data.toString("ascii");
			output.write(c);
		});
		proc.stderr.on('data', function(data){
			var c = data.toString("ascii");
			output.write(c);
		});
		proc.on('exit', function(code){
			output.destroySoon();
			fs.unlink(isRunningFile, function(err){
				if(err){
					console.log("Could not remove running info file.");
				}
				if(lockPath != ""){
					path.exists(lockPath, function(exists){
						if(exists){
							fs.unlink(lockPath, function(err){
								if(err){
									console.log("Could not remove lock");
								}
							});
						}
					});
				}
			});	
		});
	});
	var jsonMsg = {
			"runFile" : isRunningFile,
			"outFile" : outFileName,
			"id" : id
	};
	response.writeHead(200, {"Content-Type" : "text/json" });
	response.write(JSON.stringify(jsonMsg));
	response.end();	
}
/**
* Reports whether or not an app is running, and sends its current output
* via JSON. 
* @see mUtils.exports.getAppIdFromUri
* @see mUtils.exports.getAppOutputFilename
* @see mUtils.exports.getRunningFilename
* @memberOf apps
*/
exports.status = function(uri, response){
	var id = mUtils.getAppIdFromUri(uri);
	var outFile = mUtils.getAppOutputFilename(id);
	var isRunningFile = mUtils.getRunningFilename(id);
	fs.readFile(outFile, function(err, data){
		if(err){
			response.writeHead(500);
			response.write("error reading output");
			response.end();
			return;
		}
		var jsonMsg = {
			"output" : data.toString("ascii")
		};
		path.exists(isRunningFile, function(exists){
			if(exists){
				jsonMsg.running = true;
			}else{
				jsonMsg.running = false;
			}
			response.writeHead(200, {"Content-Type" : "text/json" });
			response.write(JSON.stringify(jsonMsg));
			response.end();
		});
	});
}
/**
* Launches an application. It gets the requested app from the URI, parses its manifest,
* checks for any lock conflicts, creates the lock file (if there is one) and launches 
* the app. 
* @param uri Url request that will be parsed for the application
* @param response HTTP resopnse object
* @see mUtils.exports.getAppPathFromId
* @see mUtils.exports.getAppIdFromUri
* @see apps.executeApp
* @see configs.exports.appLockDir
* @see configs.exports.appLockExtension
* @memberOf apps
*/
exports.launchApp = function(uri, response){
	//uri is the same as used for app links in pagebuilder.js
	var fPath = mUtils.getAppPathFromId( mUtils.getAppIdFromUri(uri));
	fs.readFile(fPath, function(err, data){
		if(err){s
			response.writeHead(500);
			response.write("error reading manifest");
			response.end();
			return;
		}
		var app = mUtils.parseManifestData(data, fPath).Application;
		if(app.hasOwnProperty("lock")){
			var lockPath = configs.appLockDir + app.lock + configs.appLockExtension;
			console.log("Creating lock with path" + lockPath);
			path.exists(lockPath, function(exists){
				if(!exists){
					fs.writeFile(lockPath, "lock", function(err){
						if(err){
							console.log("Error creating lock file");
						}
						executeApp(app, lockPath, response);
					});	
				}else{
					//this should really return a 409 header in this case. However, 
					//due to the way in which JQuery handles JSON requests, there's 
					//no way to specify an explicit failure handler. So we specify 
					//a 200 header and instead send back an error code in the JSON. 
					//response.writeHead(409);
					var err = "An instance of an application with the same application lock ( " + app.lock + " ) is already running. Please try again when the other application has completed.";
					response.writeHead(200, {"Content-Type" : "text/json" });					
					response.write(JSON.stringify({"failure" :  err  }));
					response.end();
				}	
			});
		}else{
			executeApp(app, "", response);	
		}
	});
}
