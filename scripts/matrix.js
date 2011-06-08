//display configs
var iconSize = 96; //! Application Icon sizes. Icones are square.

//nav state
var currentDir = "";
var menuHistory = []; //! Menu nav history
var baseDir = "bin/";
//container for display (html div)
var matrixDisplay;
//socket used for polling and such
var socket;
//div used for text output
var outputContainer;
//cache for menu
var menuCache = [];

var clearScreen = function(){
	$(matrixDisplay).empty();
	outputDiv = false;
}
var setBaseStyles = function(elem){
	$(elem).addClass("base");
}
var log = function(message){
	var clientSide = false;
	if(clientSide){
		console.log(messege);
	}else{
		var jsonMessage = { "Message" : { "type" : "log", "content" : "Client: " + message}};
		if(socket){
			socket.send(JSON.stringify(jsonMessage));
		}else{
			alert("Socket Transfer Failed\n Socket:\n "+ socket + "\nOriginal Message:\n" +message);
		} 
	}
	
}
/**
	Creates a new icon on the Matrix Display
	@param container HTML element to hold the new icon
	@param src image url for the icon
	@param w icon width
	@param h icon height
	@param tgt parameter used by clickfn
	@parameter clickfn a function that is invoked when the icon is clicked
*/
var addIcon = function(container, src, w, h, tgt, clickfn){
	var newDiv = $(document.createElement("div"));
	var img = $(document.createElement("img"));
	$(img).attr("src", src);
	$(img).attr("width", w);
	$(img).attr("height", h);
	newDiv.append(img);
	newDiv.click(clickfn);
	$(container).append(newDiv);
	setBaseStyles(newDiv);
	return newDiv;
}
/**
	Turns an application's JSON description into an HTML element and adds event handlers.
	@param container The HTML element (usually div) that will contain the application described by info
	@param info The JSON encoded information from the application's manifest, plus some additional information 
	added by the server.
*/
var processApp = function (container, info){
	var app = info.Application;
	var imgUrl = baseDir + app.iconName;
	var clickfn;
	var tgt;	
	if(app.appName == "Submenu"){
		tgt = currentDir + app.contents;		
		clickfn = function(e){
			log("Loading dir: " +tgt);
			gotoWithHistory(tgt);
		};
	}else{
		tgt = app.manifestPath;
		clickfn = function(e){
			log("app icon clicked");
			launchApp(tgt);
		}
	}
	var appDiv = addIcon(container, imgUrl, iconSize, iconSize, tgt, clickfn); 
	if(app.title != ""){
		var appTitle = document.createElement("p");
		$(appTitle).text(app.title);
		$(appTitle).addClass("appTitle");	
		$(appDiv).append(appTitle);	
	}

}
/**
	Draws the top portion of the display (TI logo, title, exit/back button)
*/
var drawHeader = function(){
	var header = document.createElement("div");
	//TI logo (loads main menu when clicked)
	addIcon(header, "header/tex.png", iconSize, iconSize, "", function(){
		buildMenu("");
	});
	//Header
	var titleDiv = document.createElement("div");
	var title = "Matrix Application Launcher";
	$(titleDiv).append(title);
	setBaseStyles(titleDiv);
	$(header).append(titleDiv);
	//Exit/back button
	var exit = addIcon(header, "header/exit-icon.png", iconSize, iconSize, "", function(){
		if(menuHistory.length >= 1){
			buildMenu(menuHistory.pop());
		}
	});
	$(exit).css("float", "right");
	$(header).css("display", "block");
	$(header).css("clear", "both");
	//add it to the main div
	matrixDisplay.append(header);
}
/**
	Processes the JSON encoded list of applications for a given subdirectory
	@param data the list of application manifests
*/
var processMenu = function(data){
	drawHeader();
	var itemDiv = document.createElement("div");
	for(var idx = 0; idx < data.length; idx ++){
		processApp(itemDiv, data[idx]);
	}
	$(itemDiv).css("display", "block");
	$(itemDiv).css("clear", "both");
	matrixDisplay.append(itemDiv);
}
/**
	Loads the submenu and adds a history entry
	@param dir submenu to load
*/
var gotoWithHistory = function(dir){
	menuHistory.push(currentDir);
	buildMenu(dir);
}
/**
	Fetches the application list from the server for the given submenu and renders it.
	@param dir the submenu level ("" is the main menu)
*/
var buildMenu = function(dir){
	clearScreen();
	currentDir = dir;	
	var url = "applist/" + dir; //! url to request applist from 

	if(menuCache.hasOwnProperty(dir)){
		processMenu(menuCache[dir]);
		log("using cached menu");
	}else{
		log("fetching new menu");
		$.getJSON(url, function(data) {
			menuCache[dir] = data;
			processMenu(data);
		});
	}
}
/**
	Handles output from application launch and execution. Messages are JSON encoded according to the specs in /lib/apps.js.
	@param msg JSON encoded message
*/
var handleMessage = function(msg){
	if(msg == "Error"){
		buildMenu(currentDir);
		return;
	}
	log(msg);
	var obj = JSON.parse(msg);
	if(!obj.hasOwnProperty("Message")){
		//Bad JSON
		return;
	}
	if(!obj.Message.hasOwnProperty("type")){
		//More bad json
		return;
	}
	switch(obj.Message.type){
		case "appInit": 
			log(obj.Message);
		break;
		case "appOutput":
			if(outputDiv == false){
				clearScreen();
				outputDiv = document.createElement("div");
				$(matrixDisplay).append(outputDiv );
			}
			$(outputDiv).append("<pre>" + obj.Message.content + "</pre>");
		break;
		case "appComplete":
			var home = addIcon(outputDiv, "header/tex.png", iconSize, iconSize, "", function(){
				buildMenu("");
				$('html, body').animate({scrollTop:0}, 'medium');
	});
			$(home).addClass("homeBtn");	
		break;	
	} 	
}
/**
	Launches an application on the server. Stdout is streamed back.
	@param app the location of the application manifest to run.
*/

var launchApp = function(app){
	var msg = {
		"Message" : {
			"type" : "appLaunch",
			"path" : app
		}
	}
	socket.send(JSON.stringify(msg));
	
}
/**
	Sets up event handlers and creates the initial display
*/
var init = function(){
	outputDiv = false;
	matrixDisplay = $(document.createElement("div"));
	$(matrixDisplay).css("height", 900);
	$('body').css('overflow', 'hidden')
	$("body").append(matrixDisplay);
	buildMenu("");
	try{
		$(document.body).clickNScroll();
	}catch(e){
		log("click setup failed");
	}
	socket = new io.Socket(window.location.hostname);
	socket.connect();
	socket.on('message', handleMessage);
	log(socket);
}

window.onload = init;
