var jsdom = require("./jsdom/lib/jsdom.js");
var fs = require("fs");
var path = require("path");
var configs = require("./configs.js");
var jqueryUrl = "./jquery/jquery-1.6.1.min.js";
var htmlBasePageUrl = "index.html";

var addHeader = function( $, window, parentElem, showHome){
	var header = window.document.createElement("div");
	var tex = window.document.createElement("img");
	var title = window.document.createElement("div");
	
	tex.src = "/images/header/tex.png";
	$(tex).addClass("tex");
	
	$(title).append("Matrix Application Launcher");
	$(title).addClass("title");

	$(header).append(tex);
	$(header).append(title);
	$(header).addClass("header");
	
	if(showHome){
		var homeLink = window.document.createElement("a");
		homeLink.href = configs.appListPrefix;
		var home = window.document.createElement("img");
		home.src = "/images/multi-icon.png";
		$(home).addClass("mainMenuBtn");
		$(homeLink).append(home);
		$(header).append(homeLink);
	}

	$(parentElem).append(header);
}
var addApp = function( $, window, parentElem, appInfo){
	var appDiv = window.document.createElement("div");
	var app = appInfo.Application;
	var url;
	if(app.appName == "Submenu"){
		url = configs.appListPrefix + app.contents;
	}else{
		var appId = new Buffer(app.manifestPath).toString("base64");
		console.log(appId);
		url = "/app/" +appId ;
	}
	var link = window.document.createElement("a");
	link.href = url;
	var img = window.document.createElement("img");
	$(img).attr("src", "/bin/" +app.iconName);
	$(img).addClass("app_icon");
	$(link).append(img);
	var title = window.document.createElement("p");
	var titleText = "&nbsp;";
	if(app.hasOwnProperty("title")){
		titleText = app.title;
	}
	$(title).append(titleText);
	$(title).addClass("appTitle");
	$(link).append(title);
	$(appDiv).append(link);
	$(appDiv).addClass("base");
	$(appDiv).addClass("appContainer");
	$(parentElem).append(appDiv);	
}
var getHtml = function($){

   var htmlStartTag = function () {
      var attrs = $('html')[0].attributes;  
      var result = '<html';
      $.each(attrs, function() { 
         result += ' ' + this.name + '="' + this.value + '"';
      });                                               
      result += '>';
      return result;
   }    

   return htmlStartTag() + $('html').html() + '</html>';
}
var getCachePageName = function(submenu){
	return configs.menuCacheDir + "menu_"+submenu.replace("/", "_") + ".html";
}
exports.hasCachedMenu = function(submenu){
	return path.existsSync(getCachePageName(submenu));
}
exports.loadCachedMenu = function(submenu, response){
	var file = getCachePageName(submenu);
	fs.readFile(file, function(err, data){
		if(err){
			response.writeHead(500);
			response.write("File Read Error");
			response.end();
			return;
		}
		response.writeHead(200);
		response.write(data.toString("ascii"));
		response.end();
	});
}
exports.createMenuPage = function(apps, response, submenu){
	fs.readFile(htmlBasePageUrl, function(error, data){
		if(error){
			return "Error";
		}
		jsdom.env({
			html: data.toString("ascii"),
			scripts: [ jqueryUrl ] 
			}, function(err, window){
				if(error){
					return "Error";
				}
				var $ = window.jQuery;
				var matrixDisplay = window.document.createElement("div");
				//console.log("creating header");
				addHeader( $, window, matrixDisplay, submenu !== "");
				//console.log("adding apps");
				var appContainer = window.document.createElement("div");
				for(var idx = 0; idx < apps.length; idx ++){
					addApp($, window,appContainer , apps[idx]);
				}
				$(appContainer).addClass("menuContainer");
				$(matrixDisplay).append(appContainer);
				$(window.document.body).append(matrixDisplay);
				var responseHtml =  getHtml($);
				fs.writeFile(getCachePageName(submenu), responseHtml, function(err){
					if(err){
						console.log("Could not write cache file");
					}
				});
//				console.log(responseHtml);
				response.writeHead(200);
				response.write(responseHtml);
				response.end();
			});
	});
}
exports.createAppPage = function(appId, response){
	var manifestPath = new Buffer(appId, "base64").toString("ascii");
	console.log(manifestPath);
}
