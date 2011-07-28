var fs = require("fs"),
    sys = require("sys"),
    path = require("path"),
    configs = require("./configs.js"),
    mUtils = require("./matrixutils.js");

var appList = {}; 
var appDescriptions = {};
var appListStatuses = {};
var appDescriptionStatuses = {};		
exports.getAppListPrefix = function(){
	return configs.appListPrefix;
}
exports.getAppsDir = function(){
	return path.join(process.cwd(), configs.appsFolder);
}
exports.getConfigFilename = function(){
	return configs.appDescriptionName;
}
var saveAppList = function(){
	var appListCache = configs.cacheDir + configs.appListCacheFile;
	fs.writeFile(appListCache, JSON.stringify(appList), function(err){
		if(err){
			console.log("Error making app list cache");
		}
	});
}
var saveAppDescriptions = function(){
	var appDescCache = configs.cacheDir + configs.appDescriptionsCacheFile;
	fs.writeFile(appDescCache, JSON.stringify(appDescriptions), function(err){
		if(err){
			console.log("Error making app description cache");
		}
	});
}
exports.isInSubmenu = function(actual, requested){
	return mUtils.pathCompare(actual, requested);
}
exports.checkCompletion = function(response, submenu, callback){
	for(var i in appListStatuses[submenu]){
		if(appListStatuses[submenu][i] == 0){
			return;
		}
	}
	console.log(appList[submenu].length);
	callback(appList[submenu].sort(mUtils.compareApps), response, submenu);
	saveAppList();
}
exports.processItem = function(filePath, response, submenu, callback){
	fs.stat(filePath, function(err, stats){
		if(err){
			appListStatuses[submenu][filePath] = 1;
			exports.checkCompletion(response, submenu, callback);
			return;	
		}
		if(stats.isDirectory()){
			fs.readdir(filePath, function(err, files){
				if(err){
					appListStatuses[submenu][filePath] = 1;
					exports.checkCompletion(response, submenu, callback);	
					return;
				}
				var indices = [];
				for(var i in files){
					var idx = path.join(filePath, files[i]);
					appListStatuses[submenu][idx] = 0;
					indices.push(idx);	
				}
				for(var i in indices){
					exports.processItem(indices[i], response, submenu, callback); 
				}
				appListStatuses[submenu][filePath] = 1;
			});	
		} else{
			if(mUtils.isManifest(filePath)){
				fs.readFile(filePath, function(err, data){
					if(err){
						appListStatuses[submenu][filePath] = 1;
						exports.checkCompletion(response, submenu, callback);	
						return;
					}
					var parsed = mUtils.parseManifestData(data, filePath);
					if(mUtils.isInSubmenu(parsed.Application, submenu) && appListStatuses[submenu][filePath] != 1){
						appList[submenu].push(parsed);
					}
					appListStatuses[submenu][filePath] = 1;
					exports.checkCompletion(response, submenu, callback);
				});
			}else{
				appListStatuses[submenu][filePath] = 1;
				exports.checkCompletion(response, submenu, callback);
			}
		}
	});
}
exports.readFilesystemApps = function(submenu, response, callback){
	var filePath = configs.appsFolder;
	path.exists(filePath, function(exists){
		if(!exists){
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}
		fs.stat(filePath, function(err, stats){
			if(err){
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}
			if(!stats.isDirectory()){
				response.writeHead(500, {"Content-Type": "text/plain"});
                                response.write("Invalid Listing\n");
                                response.end();
                                return;
			}
			fs.readdir(filePath, function(err, files){
				if(err){
	                                response.writeHead(500, {"Content-Type": "text/plain"});
        	                        response.write(err + "\n");
                	                response.end();
                        	        return;
				}
				appListStatuses[submenu] = {};
				appList[submenu] = [];
				var i = 0;
				for(var a in files){
					appListStatuses[path.join(filePath, files[a])] = 0;
				}	
				for(var idx in files){
					exports.processItem(path.join(filePath, files[idx]), response, submenu, callback);
				}
			});
		});
	}); 
}
/**
	callback should be of the form function (list, response, submenu)  
*/
exports.generateAppList = function(submenu, response, callback){
	var appListCache = configs.cacheDir + configs.appListCacheFile;
	if(appList.hasOwnProperty(submenu)){
		callback(appList[submenu], response, submenu);
		return;
	}
	path.exists(appListCache, function(exists){
		if(exists){
			fs.readFile(appListCache, function(err, data){
				if(err){
					exports.readFilesystemApps(submenu, response, callback);
					return;
				}
				
				var list = JSON.parse(data);
				if(list.hasOwnProperty(submenu)){
					callback(list[submenu], response, submenu);
					appList[submenu] = list[submenu];
					return;
				}else{
					exports.readFilesystemApps(submenu, response, callback);
				}
			});
		}else{
			exports.readFilesystemApps(submenu, response, callback);	
		}
	});
}
var appDescriptionCallback = function(list, response, submenu){
	var nComplete = 0;
	var n = list.length;
	appDescriptions[submenu] = {};
	appDescriptionStatuses[submenu] = {};

	for(var i in list){
		var app = list[i].Application;
		var idx = "app_" + app.path64;
		if(app.hasOwnProperty("appDescription")){
			if(path.existsSync(app.appDescription)){
				appDescriptions[submenu][idx] = fs.readFileSync(app.appDescription).toString("ascii");
			}else{
				appDescriptions[submenu][idx] = "App specified a nonexistant description page";
			}
			
		}else if(app.hasOwnProperty("comment")){
			appDescriptions[submenu][idx] = app.comment;
		}else{
			appDescriptions[submenu][idx] = "No description provided";	
		}
	}
        mUtils.writeJSON(appDescriptions[submenu], response);
        saveAppDescriptions();
}

exports.generateAppDescriptions = function(uri, response){
	var submenu = "*";
	var cacheFile = configs.cacheDir + configs.appDescriptionsCacheFile;
	if(appDescriptions.hasOwnProperty(submenu) && appDescriptions[submenu].length >= 1){
		mUtils.writeJSON(appDescriptions[submenu], response);
		return;
	}
	path.exists(cacheFile, function(exists){
		if(exists){
			fs.readFile(cacheFile, function(err, data){
				if(err){
					exports.generateAppList(submenu, response, appDescriptionCallback);
					return;
				}
				var list = JSON.parse(data);
				if(list.hasOwnProperty(submenu) && list[submenu].length >= 1){
					mUtils.writeJSON(list[submenu], response);
				}else{
					exports.generateAppList(submenu, response, appDescriptionCallback);
				}				
			});
		}else{
			exports.generateAppList(submenu, response, appDescriptionCallback);	
		}
	});

}
