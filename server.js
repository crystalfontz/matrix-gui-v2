var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    loader = require("./lib/load_static_file"),
    applist = require("./lib/applist"),
    appLauncher = require("./lib/apps"),
    io = require("./lib/socket.io/lib/socket.io/");

var server = http.createServer(function(request, response) {  
	var uri = url.parse(request.url).pathname;  

	if(applist.isAppListRequest(uri)) {  
		applist.generateAppList(uri, response);  
	}else {  
		loader.load_static_file(uri, response);  
	}  
});
server.listen(8080);  
  
var socket = io.listen(server);
socket.on('connection', function(client){
	client.on('connection', function(){
		console.log("new connection made");
	});
	client.on('message', function(message){
		appLauncher.handleMessage(message, client);	
	});
	client.on('disconnect', function(){

	});
});

sys.puts("Server running at http://localhost:8080/");  

