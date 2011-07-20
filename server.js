var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    loader = require("./lib/load_static_file"),
    applist = require("./lib/applist"),
    appLauncher = require("./lib/apps"),
    mUtils = require("./lib/matrixutils.js"),
    pageBuilder = require("./lib/pageBuilder.js"),
    configs = require("./lib/configs.js");;

mUtils.checkDirs();

var server = http.createServer(function(request, response) {  
	var uri = url.parse(request.url).pathname;
//	console.log("new request for uri: " + uri);  
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
		appLauncher.launchApp(uri, response);
	}else if (mUtils.isAppOutputRequest(uri)){
		pageBuilder.createAppOutputPage(uri, response);
	}else if(mUtils.isAppStatusRequest(uri)){
		appLauncher.status(uri, response);
	}else if(mUtils.isAllAppDescriptionsRequest(uri)){
		applist.generateAppDescriptions(uri, response);	
	}else{  
		loader.load_static_file(uri, response);  
	}  
});
server.listen(8080);  
sys.puts("Server running at http://localhost:8080/");  

