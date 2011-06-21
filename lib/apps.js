var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    spawn = require('child_process').spawn,
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
		var proc = spawn(executable, options);
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
	var redirectPath =configs.appOutputPrefix+id;
	response.writeHead(302, {
			'Location' : redirectPath
	});
	response.end();	
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
			var lockPath = path.join(configs.appLockDir, app.lock, configs.appLockExtension);
			path.exists(lockPath, function(exists){
				if(!exists){
					fs.writeFile(lockPath, "lock", function(err){
						if(err){
							console.log("Error creating lock file");
						}
						executeApp(app, lockPath, response);
					});	
				}
				response.writeHead(409);
				response.write("Lock already exists and is in use");
				response.end();	
			});
		}else{
			executeApp(app, "", response);	
		}
	});
}
/*

var sendAppDescription = function(parsed, client){
	var manifestPath = parsed.Message.content;
	console.log(manifestPath);
	path.exists(manifestPath, function(exists){
		if(!exists){
			return;
		}
		fs.readFile(manifestPath, function(err, data){
			if(err){
				var msg = { "Message" : {"type" : "appDescription", "content" : "The specified manifest file does not exist" }};
				return;
			}
			var manifest = JSON.parse(data);
			console.log(manifest);
			if(manifest.Application.hasOwnProperty("appDescription")){
				var descPath = manifest.Application.appDescription;
				path.exists(descPath, function(exists){
					if(!exists){
						var returnMessage = { "Message" : {"type" : "appDescription", "content" : "The specified app description file does not exist" }};
						client.send(JSON.stringify(returnMessage));
					}
					fs.readFile(descPath, function(err, contents){
						var returnMessage;							
						if(err){
							returnMessage = { "Message" : {"type" : "appDescription", "content" : "Error reading app description" }};
						}else{
							returnMessage = { "Message" : {"type" : "appDescription", "content" : contents.toString("ascii") }};
						}
						client.send(JSON.stringify(returnMessage));
					});
				});
			}else{
				var returnMessage = {"Message" : {"type" : "appDescription", "content": "No Description Given"}};
				client.send(JSON.stringify(returnMessage));
			}
		});
	});
}
var launchApp = function(app, options,  client){
		
	var proc = spawn(app, options);
	var msg;
	if(proc.pid > 0){
		msg = { "Message" : { "type" : "appInit", "content" : "success" }};	
	}else{
		msg = { "Message" : { "type" : "appInit", "content" : "failure" }};
	}
	console.log(msg);
	client.send(JSON.stringify(msg));
	proc.stdout.on('data', function(data){
		var c = data.toString("ascii");
		var msg = { "Message" : { "type" : "appOutput", "content" : c }};
		console.log(msg);
		client.send(JSON.stringify(msg));
	});
	proc.on('exit', function(code){
		var msg = { "Message" : { "type" : "appComplete", "code" : code }};
		console.log(msg);
		client.send(JSON.stringify(msg));
	});
}
exports.handleMessage = function(message, client){
	/*
	See messageSchema.txt for messages
	* /
	var parsed = JSON.parse(message);
	if(!parsed.hasOwnProperty("Message")){
		console.log("Malformed Message recieved.");
		return;
	}
	if(!parsed.Message.hasOwnProperty("type")){
		console.log("Malformed Message recieved.");
		return;
	}
	switch(parsed.Message.type){
		case  "appLaunch": 
			console.log("launching app");
			path.exists(parsed.Message.path, function(exists){
				if(!exists){
					client.send("Error");	
				}
				fs.readFile(parsed.Message.path, function(err, data){
					if(err){
						client.send("Error");	
					}
					var appInfo = JSON.parse(data);
					var params = [];				
					if(appInfo.Application.hasOwnProperty("appParameters")){
						params = appInfo.Application.appParameters.split(" ");
					}
					launchApp(appInfo.Application.appName, params, client);
					console.log("app launched");
				});
			});
			break;
		case "log": 
			console.log(parsed.Message.content);
			break;
		case "appDescriptionRequest":
			sendAppDescription(parsed, client);
			break;
		default:
			console.log("Unrecognized message type recieved: " + parsed.Message.type);
			break
		}
}
*/
