//display configs
var iconSize = 96; //image sizes
//nav configs
var currentDir = "";
var prevDir = "";
var baseDir = "bin/";
//container for display
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
var processApp = function (container, info){
	var app = info.Application;

	var imgUrl = baseDir + app.iconName;
	var clickfn;
	var tgt;	
	if(app.appName == "Submenu"){
		tgt = currentDir + app.contents;		
		clickfn = function(e){
			console.log("Loading dir: " +tgt);
			buildMenu(tgt);
		};
	}else{
		tgt = app.manifestPath;
		clickfn = function(e){
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
var drawHeader = function(){
	var x = 10;
	var hSpacing = 25; 

	var header = document.createElement("div"); 
	addIcon(header, "header/tex.png", iconSize, iconSize, "", function(){
		buildMenu("");
	});
	var titleDiv = document.createElement("div");
	var title = "Matrix Application Launcher";
	$(titleDiv).append(title);
	setBaseStyles(titleDiv);
	$(header).append(titleDiv);
	var exit = addIcon(header, "header/exit-icon.png", iconSize, iconSize, "", function(){
		buildMenu(prevDir);
	});
	$(exit).css("float", "right");
	$(header).css("display", "block");
	$(header).css("clear", "both");
	matrixDisplay.append(header);
}
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
var buildMenu = function(dir){
	clearScreen();
	prevDir = currentDir;
	currentDir = dir;	
	var url = "applist/" + dir;

	if(menuCache.hasOwnProperty(dir)){
		processMenu(menuCache[dir]);
		console.log("using cached menu");
	}else{
		console.log("fetching new menu");
		$.getJSON(url, function(data) {
			menuCache[dir] = data;
			processMenu(data);
		});
	}
}
var handleMessage = function(msg){
	if(msg == "Error"){
		buildMenu(currentDir);
		return;
	}
	console.log(msg);
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
			console.log(obj.Message);
		break;
		case "appOutput":
			if(outputDiv == false){
				clearScreen();
				outputDiv = document.createElement("div");
				$(matrixDisplay).append(outputDiv );
			}
			$(outputDiv).append("<pre>" + obj.Message.content + "</pre>");
			//$(outputDiv).append(obj.Message.content.replace(/\\n/gi, "<br />"));
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

var launchApp = function(app){
	//this should deal with launching / executing an app and
	//dealing with the output... 
	var msg = {
		"Message" : {
			"type" : "appLaunch",
			"path" : app
		}
	}
	socket.send(JSON.stringify(msg));
	
}

var init = function(){
	outputDiv = false;
	matrixDisplay = $(document.createElement("div"));
	$(matrixDisplay).css("height", 900);
	$('body').css('overflow', 'hidden')
	$("body").append(matrixDisplay);
	buildMenu("");
	$(document.body).clickNScroll();
	socket = new io.Socket(window.location.hostname);
	socket.connect();
	socket.on('message', handleMessage);
}

window.onload = init;
