var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    loader = require("./lib/load_static_file"),
    applist = require("./lib/applist"),
    apps = require("./lib/apps"),
    mUtils = require("./lib/matrixutils.js"),
    pageBuilder = require("./lib/pageBuilder.js"),
    configs = require("./lib/configs.js");;

//check to make sure the required folders exist
mUtils.checkDirs();
/**
* This is the core of the server portion of matrix. It binds to port 8080 and 
* listens for requests. When a request is recieved, it determines the type
* of request and calls the appropriate handler. Valid types of request are:
* app list, menu page (including a submenu), app description page, application
* icon, clear disk cache, launch application, application output, application 
* status, and app description list (all app description pages). If none of 
* those are matched, it will treate the request as a request for a static file
* with web root of the process' working directory. 
* @see mUtils.exports.isAppListRequest
* @see applist.exports.generateAppList
* @see mUtils.exports.isAppMenuRequest
* @see pageBuilder.exports.createMenuPage
* @see mUtils.exports.isAppDescriptionRequest
* @see pageBuilder.exports.createAppPage
* @see mUtils.exports.isAppIconRequest
* @see loader.exports.loadIcon
* @see mUtils.exports.isCacheClearRequest
* @see mUtils.exports.clearCache
* @see mUtils.exports.isAppLaunchRequest
* @see apps.exports.launchApp
* @see mUtils.exports.isAppOutputRequest
* @see mUtils.exports.isAppStatusRequest
* @see apps.exports.status
* @see mUtils.exports.isAllAppDescriptionsRequest
* @see applist.exports.generateAppDescriptions
* @see loader.exports.load_static_file
* @name server
* @field
*/
var server = http.createServer(function(request, response) {  
	//turn URL into URI
	var uri = url.parse(request.url).pathname;
	console.log("new request for uri: " + uri);
	//determine the type of request, and then handle it.  
	if(mUtils.isAppListRequest(uri)) {
		applist.generateAppList("*", response, mUtils.writeJSON);
	}else if(mUtils.isAppMenuRequest(uri)){
		var submenu = uri.substring(configs.appMenuPrefix.length);
		pageBuilder.createMenuPage(submenu, response);
	}else if(mUtils.isAppDescriptionRequest(uri)){
		pageBuilder.createAppPage(uri, response); 
	}else if(mUtils.isAppIconRequest(uri)){
		loader.loadIcon(uri, response);
	}else if(mUtils.isCacheClearRequest(uri)){
		mUtils.clearCache(response);
	}else if(mUtils.isAppLaunchRequest(uri)){
		apps.launchApp(uri, response);
	}else if (mUtils.isAppOutputRequest(uri)){
		pageBuilder.createAppOutputPage(uri, response);
	}else if(mUtils.isAppStatusRequest(uri)){
		apps.status(uri, response);
	}else if(mUtils.isAllAppDescriptionsRequest(uri)){
		applist.generateAppDescriptions(uri, response);	
	}else{  
		loader.load_static_file(uri, response);  
	}  
});
server.listen(8080);  
sys.puts("Server running at http://localhost:8080/");  

