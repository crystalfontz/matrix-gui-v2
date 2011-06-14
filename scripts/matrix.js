var iconSize = 96; //! Application Icon sizes. Icones are square.
var currentDir = ""; //! Current submenu
var menuHistory = []; //! Menu nav history
var baseDir = "bin/"; //! filesystem root app dir
var matrixDisplay;//! container for display (html div)
var socket; //!socket used for polling and such
var outputContainer;//!div used for text output
var menuCache = [];//! cache for menu
var showAppDescriptions = true;	//! Whether or not to show app descriptions
var currentApp = ""; //! location of the current app's manifest
var logDiv;
//! Animated scroll to top
var scrollToTop = function(){
	$('html, body').animate({scrollTop:0}, 'medium');
}
//! adds a floating main menu icon
/**
	Used by the app launcher after completion and as a cancel button on the app description page
*/
var addHomeBtn = function(){
	var home = addIcon(outputDiv, "images/multi-icon.png", iconSize, iconSize, "", function(){
		buildMenu("");
		scrollToTop();
	});
	$(home).addClass("homeBtn");	
}
//! removes all elements
var clearScreen = function(){
	$(matrixDisplay).empty();
	outputDiv = false;
}
//! creates output div used for text output and app descriptions
var createOutputDiv = function(){
	if(outputDiv == false){
		clearScreen();
		drawHeader();
		outputDiv = document.createElement("div");
		$(outputDiv).addClass("outputDiv");
		$(matrixDisplay).append(outputDiv );
	}
}
//! adds the main css styles to the elem
var setBaseStyles = function(elem){
	$(elem).addClass("base");
}
var log = function(msg, logMode){
	/*
	log options:
	-client_div
	-client_console
	-client_alert
	-server
	-none
	*/
	logMode = (typeof(logMode) != 'undefined') ? logMode : "client_div";
	switch (logMode){
		case "none":
			return;
		break;
		case "client_console":
			console.log(msg);
		break;
		case "client_alert":
			alert(msg);
		break
		case "client_div":
			$(logDiv).prepend("<pre>"+ msg + "</pre>");
		break;
		case "server":
			var jsonMessage = { "Message" : { "type" : "log", "content" : "Client: " + msg}};
			if(!socket){
				createSocket();
			}
			if(socket){
				socket.send(JSON.stringify(jsonMessage));
			}else{
				alert("Socket Transfer Failed\n Socket:\n "+ socket + "\nOriginal Message:\n" +msg);
			} 
		break;
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
			appClicked(tgt);
		}
	}
	var appDiv = addIcon(container, imgUrl, iconSize, iconSize, tgt, clickfn); 
	if(app.title != ""){
		var appTitle = document.createElement("p");
		$(appTitle).text(app.title);
		$(appTitle).addClass("appTitle");	
		$(appDiv).append(appTitle);	
	}
	$(appDiv).addClass("appContainer");
}
/**
	Draws the top portion of the display (TI logo, title, back button)
*/
var drawHeader = function(){
	var headerIconSize = 32;
	var header = document.createElement("div");
	//TI logo (loads main menu when clicked)
	addIcon(header, "images/header/tex.png", headerIconSize, headerIconSize, "", function(){
		buildMenu("");
	});
	//Title
	var titleDiv = document.createElement("div");
	var title = "Matrix Application Launcher";
	$(titleDiv).append(title);
	setBaseStyles(titleDiv);
	$(titleDiv).addClass("title");
	$(header).append(titleDiv);

	if(menuHistory.length >= 1){
	//Back button
		var back = addIcon(header, "images/multi-icon.png", headerIconSize, headerIconSize, "", function(){
			if(menuHistory.length >= 1){
				buildMenu(menuHistory.pop());
			}
		});
	}
	$(back).css("float", "right");
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
	scrollToTop();
}
/**
	Loads the submenu and adds a history entry
	@param dir submenu to load
*/
var gotoWithHistory = function(dir){
	menuHistory.push(currentDir);
	buildMenu(dir);
	scrollToTop();
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
	Handles output from application launch and execution. Messages are JSON encoded according to the specs in /lib/messageSchema.txt.
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
			createOutputDiv();
			$(outputDiv).append("<pre>" + obj.Message.content + "</pre>");
		break;
		case "appComplete":
			addHomeBtn();
		break;
		case "appDescription":
			log(obj.Message.content);
			showAppDescription(obj.Message.content);
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
	if(!socket) createSocket();
	socket.send(JSON.stringify(msg));
	currentApp = "";
	clearScreen();
	buildMenu(currentDir);
}
var showAppDescription = function(desc){
	createOutputDiv();
	$(outputDiv).append(desc);
	var launcher = addIcon(outputDiv, "images/run-icon.png", iconSize, iconSize, "", function(){launchApp(currentApp);});
	$(launcher).addClass("runDiv");
}
var requestAppDescription = function(app){
	var msg = {
		"Message" : {
			"type" : "appDescriptionRequest",
			"content" : app
		}
	}
	if(!socket){
		createSocket();
	}
	log("Created message: " + JSON.stringify(msg));
	socket.send(JSON.stringify(msg));
	log("description request sent");
}
var appClicked = function(app){
	log(app);
	currentApp = app;
	if(!showAppDescriptions){
		log("launching");
		launchApp(app);
	}else{
		log("getting desc");
		requestAppDescription(app);
	}
}
var createSocket = function(){
                socket = new io.Socket(window.location.hostname, {"transports" : ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling'], "port" : 8080});
                socket.connect();
                socket.on('message', handleMessage);
}
/**
	Sets up event handlers and creates the initial display
*/
var init = function(){
	log("making socket", "client_div");
	createSocket();
	log("socket made", "client_div");
	outputDiv = false;
	matrixDisplay = $(document.createElement("div"));
	logDiv = $(document.createElement("div"));
//	$(matrixDisplay).css("height", 900);
	$('body').css('overflow', 'hidden')
	$("body").append(matrixDisplay);
	$("body").append(logDiv);
	buildMenu("");
	try{
		$(document.body).clickNScroll();
	}catch(e){
		log("click setup failed");
	}
}

window.onload = init;
