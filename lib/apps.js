var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    spawn = require('child_process').spawn;

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
	---Client Messages---
	Messages should be json encoded, like so:	
	{
		Message :{
			type : appLaunch,
			path : /path/to/manifest/ 
		}
	}
	{
		Message :{
			type : log
			content : content to output
		}
	}	
	---Server Messages---
	{
		Message :{
			type : appInit
			content : success | failure
		}
	}
	{
		Message :{
			type : appOutput,
			content : outputline 
		}
	}
	{
		Message :{
			type : appComplete,
			code: exit code
		}
	}
	*/
	var parsed = JSON.parse(message);
	switch(parsed.Mesage.type){
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
		}
}
