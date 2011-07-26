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
	Executes an app. LockPath will be deleted on completion of the app if it exists. 
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
/*	var redirectPath =configs.appOutputPrefix+id;
	response.writeHead(302, {
			'Location' : redirectPath
	});
	response.end();
*/
	var jsonMsg = {
			"runFile" : isRunningFile,
			"outFile" : outFileName,
			"id" : id
	};
	response.writeHead(200, {"Content-Type" : "text/json" });
	response.write(JSON.stringify(jsonMsg));
	response.end();	
}
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
exports.launchApp = function(uri, response){
	//uri is the same as used for app links in pagebuilder.js
	var fPath = mUtils.getAppPathFromId( mUtils.getAppIdFromUri(uri));
	fs.readFile(fPath, function(err, data){
		if(err){
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
					//this should really return a 409 header. However, due to the 
					//way in which JQuery handles JSON requests, there's no way to 
					//specify an explicit failure handler. So we specify a 200 
					//header and instead send back an error code in the JSON. 
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
