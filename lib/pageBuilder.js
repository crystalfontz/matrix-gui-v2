var jsdom = require("./jsdom/lib/jsdom.js");
var fs = require("fs");
var path = require("path");
var configs = require("./configs.js");
mUtils = require("./matrixutils.js");

var addHeader = function( $, window, parentElem, showHome){
	var header = window.document.createElement("div");
	var tex = window.document.createElement("img");
	var title = window.document.createElement("div");
	
	tex.src = configs.matrixImagesFolder+"header/tex.png";
	$(tex).addClass("tex");
	$(tex).attr("id", "txlogo" );
	$(title).append("Matrix Application Launcher");
	$(title).addClass("title");

	$(header).append(tex);
	$(header).append(title);
	$(header).addClass("header");
	
	if(showHome){
		var homeLink = window.document.createElement("a");
		homeLink.href = configs.appListPrefix;
		var home = window.document.createElement("img");
		home.src = configs.matrixImagesFolder+"multi-icon.png";
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
		var appId = mUtile.getAppIdFromFilepath(app.manifestPath);
		url = configs.appDescriptionPrefix + appId ;
	}
	var link = window.document.createElement("a");
	link.href = url;
	var img = window.document.createElement("img");
	$(img).attr("src", path.join(configs.iconPrefix, app.iconName));
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
exports.getMenuCachePageName = function(submenu){
	return configs.cacheDir + "menu_"+submenu.replace("/", "_") + ".html";
}
exports.getAppCachePageName = function(appId){
	return configs.cacheDir + "app_"+appId + ".html";
}
exports.hasCachedMenu = function(submenu){
	return path.existsSync(exports.getMenuCachePageName(submenu));
}
exports.hasCachedAppPage = function(appId){
	return path.existsSync(exports.getAppCachePageName(appId));
}
exports.loadCachedFile = function(file, response){
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
exports.loadCachedMenu = function(submenu, response){
	exports.loadCachedFile(exports.getMenuCachePageName(submenu), response);
}
exports.loadCachedAppPage = function(appId, response){
	exports.loadCachedFile(exports.getAppCachePageName(appId), response);
}
exports.createMenuPage = function(apps, response, submenu){
	fs.readFile(configs.htmlBasePageUrl, function(error, data){
		if(error){
			return "Error";
		}
		jsdom.env({
			html: data.toString("ascii"),
			scripts: [ configs.jqueryUrl ] 
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
				fs.writeFile(exports.getMenuCachePageName(submenu), responseHtml, function(err){
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
var cacheApp = function(appId, html){
	fs.writeFile(exports.getAppCachePageName(appId), html, function(err){
		if(err){
			console.log("Could not write cache file for app ID:" +appId);
			return;
		}
		console.log("cache file created for app ID: " + appId);
	});
}
exports.createAppPage = function(uri, response){
	var appId = mUtils.getAppIdFromUri(uri);
	if(exports.hasCachedAppPage(appId)){
		console.log("using cached App Page");
		exports.loadCachedAppPage(appId, response);
		return;
	}
	var manifestPath = mUtils.getAppPathFromId(appId);
	path.exists(manifestPath, function(exists){
		if(!exists){
			response.writeHead(404);
			response.write("Page Not found");
			response.end();
			return;
		}
		fs.readFile(manifestPath, function(err, data){
			if(err){
				response.writeHead(500);
				response.write("Error reading file");
				response.end();
				return;
			}
			var processed = mUtils.parseManifestData(data.toString("ascii"));
			var app = processed.Application;
			fs.readFile(configs.htmlBasePageUrl, function(error, data){
				if(error){
					response.writeHead(500);
					response.write("Error");
					response.end();
					return;
				}
				jsdom.env({
					html: data.toString("ascii"),
					scripts: [ configs.jqueryUrl ] 
					}, function(err, window){
						if(error){
							response.writeHead(500);
							response.write("Error");
							response.end();
							return
						}
						var $ = window.jQuery;
						var matrixDisplay = window.document.createElement("div");
						addHeader( $, window, matrixDisplay, true);
						var appDesc = window.document.createElement("div");
						$(appDesc).addClass("outputDiv");
						$(matrixDisplay).append(appDesc);
						if(app.hasOwnProperty("appName") && app.appName != ""){
							var runDiv = window.document.createElement("div");
							var link = window.document.createElement("a");
							link.href = configs.appLaunchPrefix + appId;
							var runImg = window.document.createElement("img");
							runImg.src = configs.matrixImagesFolder+"run-icon.png";
							$(runDiv).addClass("runDiv");
							$(link).append(runImg);
							$(runDiv).append(link);
							$(matrixDisplay).append(runDiv);
						}
						$(window.document.body).append(matrixDisplay);
						if(app.hasOwnProperty("appDescription")){
							var appPage = app.appDescription;
							path.exists(appPage, function(exists){
								if(!exists){
									$(appDesc).append("App Description Page Not Found");
									var html = getHtml($);
									cacheApp(appId, html);
									response.writeHead(200);
									response.write(html);
									response.end();			
								}
								fs.readFile(appPage, function(err, data){
									var desc = "";				
									if(err){
										desc = "Error Reading App Description Page";
									}else{
										desc = data.toString("ascii");
									}
									$(appDesc).append(desc);
									var html = getHtml($);
									cacheApp(appId, html);
									response.writeHead(200);
									response.write(html);
									response.end();
									return;	
								});
							});
						}else{
							$(appDesc).append("No App Description Provided");
							var html = getHtml($);
							cacheApp(appId, html);
							response.writeHead(200);
							response.write(html);
							response.end();
							return;			
						}
				});
			});
		});
	});
}
exports.createAppOutputPage = function(uri, response){
	response.writeHead(200);
	response.write("Streaming Output Coming soon");
	response.end();
}
