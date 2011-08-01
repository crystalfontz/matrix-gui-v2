/**
* HTML Page Builder for Matrix Gui
* @author Thomas Potthast <tpotthast@ti.com> 
* @fileOverview
*/
/**
* Html page construction and manipulation
* @name pageBuilder
* @class 
*/
/**
* Public methods of pageBuilder
* @name exports
* @memberOf pageBuilder
*/
var fs = require("fs");
var path = require("path");
var configs = require("./configs.js");
var applist = require("./applist.js");
var mUtils = require("./matrixutils.js");
var jsdom = require("./jsdom");

/**
* Adds the TI logo, title, and main menu button to the provided page
* @param $ jQuery object
* @param window Window object created by jsdom
* @param parentElem Parent element for the header div
* @param showHome Whether or not to show the main menu button
* @private
* @memberOf pageBuilder
*/
var addHeader = function( $, window, parentElem, showHome){
	var header = window.document.createElement("div");
	var tex = window.document.createElement("img");
	var title = window.document.createElement("div");
	var clrLink = window.document.createElement("a");
	clrLink.href = configs.cacheClearPrefix;
	tex.src = configs.matrixImagesFolder+"header/tex.png";
	$(tex).addClass("tex");
	$(tex).attr("id", "txlogo" );
	$(tex).attr("alt", "Texas Instruments");
	$(clrLink).append(tex);
	$(title).append("Matrix Application Launcher");
	$(title).addClass("title");

	$(header).append(clrLink);
	$(header).append(title);
	$(header).addClass("header");
	
	if(showHome){
		var homeLink = window.document.createElement("a");
		homeLink.href = configs.appMenuPrefix;
		var home = window.document.createElement("img");
		home.src = configs.matrixImagesFolder+"multi-icon.png";
		$(home).addClass("mainMenuBtn");
		$(home).attr("id", "mainMenuBtn");
		$(home).attr("alt", "Main Menu");
		$(homeLink).append(home);
		$(header).append(homeLink);
	}

	$(parentElem).append(header);
}
/**
* Adds an application to the display
* @param $ jQuery Object
* @param window Window object created by jsdom
* @param parentElem Parent element of this application display
* @param appInfo JSON Application data
* @private
* @memberOf pageBuilder
*/
var addApp = function( $, window, parentElem, appInfo){
	var appDiv = window.document.createElement("div");
	var app = appInfo.Application;
	var url;
	if(app.appName == "Submenu"){
		url = configs.appMenuPrefix + app.contents;
	}else{
		var appId = mUtils.getAppIdFromFilepath(app.manifestPath);
		url = configs.appDescriptionPrefix + appId ;
	}
	var link = window.document.createElement("a");
	link.href = url;
	var img = window.document.createElement("img");
	$(img).attr("src", path.join(configs.iconPrefix, app.iconName));
	$(img).attr("alt", "[" + app.title + " Icon]");
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
/**
* Gets the entire html of a page, including <html> tag attributes, from a
* jQuery object.
* @param $ jQuery Obbject
* @private 
* @memberOf pageBuilder
*/
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
/**
* Gets the name of the cache file for a given submenu
* @param submenu Name of the submenu
* @memberOf pageBuilder
*/
exports.getMenuCachePageName = function(submenu){
	return configs.cacheDir + "menu_"+submenu.replace("/", "_") + ".html";
}
/**
* Gets the name of the cache file for a given application description page
* @param appId ID of app whose cache page to find
* @memberOf pageBuilder
*/
exports.getAppCachePageName = function(appId){
	return configs.cacheDir + "app_"+appId + ".html";
}
/**
* Checks whether or not a cache page exists for a given submenu.
* @param submenu Name of the submenu whose cache page to look for
* @memberOf pageBuilder
*/
exports.hasCachedMenu = function(submenu){
	return path.existsSync(exports.getMenuCachePageName(submenu));
}
/**
* Checks whether or not a cache page exists for a given app.
* @param appId Id of appliaction whose cache page to look for
* @memberOf pageBuilder
*/
exports.hasCachedAppPage = function(appId){
	return path.existsSync(exports.getAppCachePageName(appId));
}
/**
* Loads a file, sends its contents to response, and ends it. 
* This shopuld probably be merged with / replaced by 
* loader.exports.loadStaticFile
* @param file File to read
* @param response HTTP response object
* @see loader.exports.loadStaticFile
* @memberOf pageBuilder
*/
exports.loadCachedFile = function(file, response){
	fs.readFile(file, function(err, data){
		if(err){
			response.writeHead(500, {"Content-Type": "text/html"});
			response.write("File Read Error");
			response.end();
			return;
		}
		response.writeHead(200  , {"Content-Type": "text/html", "Cache-Control" : "max-age=720"}  );
		response.write(data.toString("ascii"));
		response.end();
	});
}
/**
* Loads a cached menu file for  a given submenu using loadCachedFile.
* @param submenu Name of sumbmenu to load
* @param response HTTP response object
* @see pageBuilder.exports.loadCachedFile
* @see pageBuilder.exports.getMenuCachePageName
* @memberOf pageBuilder
*/
exports.loadCachedMenu = function(submenu, response){
	exports.loadCachedFile(exports.getMenuCachePageName(submenu), response);
}
/**
* Loads a cached app description page for a given app using loadCachedFile.
* @param appId ID of app to load
* @param response HTTP response object
* @memberOf pageBuilder
*/
exports.loadCachedAppPage = function(appId, response){
	exports.loadCachedFile(exports.getAppCachePageName(appId), response);
}
/**
* Shows the menu page for a given uri. If it it in cache it will use it, 
* otherwise it will generate it. 
* @param uri The requested uri, containing the desired submenu
* @param response HTTP response object
* @see configs.exports.appMenuPrefix
* @see pageBuilder.exports.hasCachedMenu
* @see pageBuilder.exports.loadCachedMenu
* @see applist.exports.generateAppList
* @see pageBuilder.exports.createMenuPageFromApps
* @memberOf pageBuilder
*/
exports.createMenuPage = function(uri, response){
	var subdir = uri.substring(configs.appMenuPrefix.length);
	if(exports.hasCachedMenu(subdir)){
		console.log("using cached menu");
		exports.loadCachedMenu(subdir, response);
		return;
	}else{
		applist.generateAppList(uri, response, exports.createMenuPageFromApps);
	}
}
/**
* Takes the app list, finds the apps that belong in the submenu, and 
* constructs the menu page from them. This is passed as a callback function to 
* {@link applist.exports.generateAppList}. {@link configs.exports.htmlBasePageUrl}
* is used as the base file on which the menu is then built. jQuery (from 
* {@link configs.exports.jqueryUrl} ) is used for the DOM manipulation. Also writes
* out the generated HTML to a cache file (located at 
* {@link pageBuilder.exports.getMenuCachePageName} )
* @param apps The generated app list
* @param response HTTP response object
* @param submenu Name of sumbmenu to load
* @see pageBuilder.addApp 
* @see applist.exports.generateAppList
* @see configs.exports.htmlBasePageUrl
* @see configs.exports.jqueryUrl
* @see mUtils.exports.isInSubmenu
* @see pageBuilder.exports.getMenuCachePageName
* @memberOf pageBuilder
*/
exports.createMenuPageFromApps = function(apps, response, submenu){
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
				addHeader( $, window, matrixDisplay, submenu !== "");
				var appContainer = window.document.createElement("div");
				console.log(apps.length);
				for(var idx = 0; idx < apps.length; idx ++){
					if(mUtils.isInSubmenu(apps[idx].Application, submenu)){
						addApp($, window, appContainer , apps[idx]);
					}
				}
				$(appContainer).addClass("menuContainer");
				$(matrixDisplay).append(appContainer);
				$(window.document.body).append(matrixDisplay);
				var responseHtml =  configs.doctype+getHtml($);
				response.writeHead(200  , {"Content-Type": "text/html", "Cache-Control" : "max-age=720"}  );
				response.write(responseHtml);
				response.end();
				var appListCache = configs.cacheDir + configs.appListCacheFile;
				path.exists(appListCache, function(exists){
					if(!exists){			
						fs.writeFile(appListCache, JSON.stringify(apps), function(err){
							if(err){
								console.log("Error making app list cache");
							}
						});
					}
				});
				fs.writeFile(exports.getMenuCachePageName(submenu), responseHtml, function(err){
					if(err){
						console.log("Could not write cache file");
					}
				});
			});
	});
}
/**
* Stores the provided html in the cache using appId. 
* @param appId ID of the application whose description page is given by html.
* @param html The HTML that makes up an application's description page. 
* @see pageBuilder.exports.getAppCachePageName
* @memberOf pageBuilder
*/
var cacheApp = function(appId, html){
	fs.writeFile(exports.getAppCachePageName(appId), html, function(err){
		if(err){
			console.log("Could not write cache file for app ID:" +appId);
			return;
		}
	});
}
/**
* Creates an app description page given a request uri containing an 
* application ID and an http response. Like {@link pageBuilder.exports.createMenuPageFromApps}, 
* it uses {@link configs.exports.htmlBasePageUrl} as the base HTML page on which to work, and 
* jQuery from {@link configs.exports.jqueryUrl} to do DOM manipulation. The steps followed are: 
* convert the app ID into an app manifest, parse the manifest, read the base HTML page, use the
* manifest to find the description page, parse the description page, add the description into
* the base page, output the result to response, and finally cache the result. Note that it 
* checks the cache first and will serve up that page if found, and if not will store the 
* generated html for the next request. 
* @param uri Request URI containing an appID 
* @param response HTTP response object
* @see pageBuilder.exports.hasCachedAppPage
* @see pageBuilder.exports.loadCachedAppPage
* @see mUtils.exports.getAppPathFromId
* @see mUtils.exports.parseManifestData
* @see pageBuilder.addHeader
* @see configs.exports.jqueryUrl
* @see configs.exports.htmlBasePageUrl
* @memberOf pageBuilder
*/
exports.createAppPage = function(uri, response){
	var appId = mUtils.getAppIdFromUri(uri);
	if(exports.hasCachedAppPage(appId)){
		exports.loadCachedAppPage(appId, response);
		return;
	}
	var manifestPath = mUtils.getAppPathFromId(appId);
	path.exists(manifestPath, function(exists){
		if(!exists){
			console.log("Manifest does not exist");
			console.log("Requested path was " + manifestPath);
			response.writeHead(404, {"Content-Type": "text/html"});
			response.write("Page Not found");
			response.end();
			return;
		}
		fs.readFile(manifestPath, function(err, data){
			if(err){
				console.log("could not read manifest");
				console.log("Requested path was " + manifestPath);
				response.writeHead(500);
				response.write("Error reading file");
				response.end();
				return;
			}
			var processed = mUtils.parseManifestData(data.toString("ascii"));
			var app = processed.Application;
			fs.readFile(configs.htmlBasePageUrl, function(error, data){
				if(error){
					console.log("could not read html base page");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Error");
					response.end();
					return;
				}
				jsdom.env({
					html: data.toString("ascii"),
					scripts: [ configs.jqueryUrl ] 
					}, function(err, window){
						if(error){
							response.writeHead(500, {"Content-Type": "text/html"});
							response.write("Error");
							response.end();
							return
						}
						var $ = window.jQuery;
						var matrixDisplay = window.document.createElement("div");
						addHeader( $, window, matrixDisplay, true);
						var container = window.document.createElement("div");
						$(container).addClass("menuContainer");
						var appDesc = window.document.createElement("div");
						$(appDesc).addClass("outputDiv");
						$(matrixDisplay).append(container);
						$(container).append(appDesc);
						if(app.hasOwnProperty("appName") && app.appName != ""){
							var runDiv = window.document.createElement("div");
							var link = window.document.createElement("a");
							link.href = configs.appLaunchPrefix + appId;
							var runImg = window.document.createElement("img");
							$(runImg).attr("alt", "Launch " + app.title);
							runImg.src = configs.matrixImagesFolder+"run-icon.png";
							$(runDiv).addClass("runDiv");
							$(link).append(runImg);
							$(runDiv).append(link);
							$(container).append(runDiv);
						}
						$(window.document.body).append(matrixDisplay);
						if(app.hasOwnProperty("appDescription")){
							var appPage = app.appDescription;
							path.exists(appPage, function(exists){
								if(!exists){
									$(appDesc).append("App Description Page Not Found");
									console.log("App specified nonexistent description page");
									var html = getHtml($);
									response.writeHead(200, {"Content-Type": "text/html"});
									response.write(html);
									response.end();
									cacheApp(appId, html);
									return;			
								}
								fs.readFile(appPage, function(err, data){
									var desc = "";				
									if(err){
										desc = "Error Reading App Description Page";
										console.log("could not read description page (but it exists)");
									}else{
										desc = data.toString("ascii");
										console.log("description page found");
									}
									$(appDesc).append(desc);
									var html = configs.doctype+ getHtml($);
									response.writeHead(200 , {"Content-Type": "text/html", "Cache-Control" : "max-age=720"} );
									response.write(html);
									response.end();
									cacheApp(appId, html);
									return;	
								});
							});
						}else{
							if(app.hasOwnProperty("comment")){
								$(appDesc).append(app.comment);								
							}else{
								$(appDesc).append("No App Description Provided");
							}
							var html = configs.doctype+getHtml($);
							response.writeHead(200 , {"Content-Type": "text/html"} );
							response.write(html);
							response.end();
							cacheApp(appId, html);
							return;			
						}
				});
			});
		});
	});
}
/**
* Takes in a uri containing an app run ID and uses it to look up that run's output. 
* The output is then inserted into base html (derived from {@link configs.exports.htmlBasePageUrl}
* if the application is done executing or the reloading page (from {@link configs.exports.reloadBasePageUrl} ) 
* if the application is still executing. This creates the illusion of streaming output. (output has html 
* chars escaped)
* @param uri requested uri containing a run ID
* @param response HTTP response object
* @see mUtils.exports.getRunningFilename
* @see mUtils.exports.getOutputFilename
* @see configs.exports.reloadBasePageUrl
* @see configs.exports.htmlBasePageUrl
* @see mUtils.exports.escapeHtml
* @memberOf pageBuilder
*/
exports.createAppOutputPage = function(uri, response){
	var outputId = uri.substring(uri.lastIndexOf("/") +1);
	var filename = mUtils.getAppOutputFilename(outputId);
	path.exists(filename, function(exists){
		if(!exists){
			console.log("Output file: " + filename + " does not exist");
			response.writeHead(404);
			response.write("Requested application output not found");
			response.end();
			return;
		}
		fs.readFile(filename, function(err, outputText){
			if(err){
				console.log("Error reading output file: "+ filename);
				response.writeHead(500);
				response.write("Error Reading output file");
				response.end();
				return;
			}
  			path.exists(mUtils.getRunningFilename(outputId), function(exists){
				var basePage = configs.htmlBasePageUrl;
				if(exists || outputText == ""){
					basePage = configs.reloadBasePageUrl;
				}
				fs.readFile(basePage, function(error, data){
                        	        if(error){
						console.log("could not open base page: " + basePage);
                                	        response.writeHead(500);
                                        	response.write("Error opening template file");
    	        	                        response.end();
        	                                return;
                        	        }
                     		        jsdom.env({
                                	        html: data.toString("ascii"),
                                        	scripts: [ configs.jqueryUrl ]
                                        	}, function(err, window){
                                                	if(error){
								console.log("Could not create DOM");
                                                        	response.writeHead(500);
                                                        	response.write("Error");
                                                        	response.end();
                                                        	return
                                                	}
                                                	var $ = window.jQuery;
                                                	var matrixDisplay = window.document.createElement("div");
                                                	addHeader( $, window, matrixDisplay, true);
							$("#mainMenuBtn").addClass("homeBtn");
                                                	var output = window.document.createElement("div");
                                                	$(output).addClass("outputDiv");
							var p = window.document.createElement("pre");
							try{
								$(p).append(mUtils.escapeHtml(outputText.toString("ascii")));
							}catch(e){
								console.log("Error handling output text:");
								console.log(mUtils.escapeHtml(outputText.toString("ascii")));
							}
							$(p).attr("id", "appOutput");
							$(output).append(p);
							$(matrixDisplay).append(output);
							$(window.document.body).append(matrixDisplay);
							response.writeHead(200 , {"Content-Type":"text/html"} );
                                                	response.write(configs.doctype +getHtml($));
                                                	response.end();
						});
					});
			});
		});
	});
}
