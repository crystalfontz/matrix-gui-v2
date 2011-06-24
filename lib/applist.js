var fs = require("fs"),
    sys = require("sys"),
    path = require("path"),
    pageBuilder = require("./pageBuilder.js"),
    configs = require("./configs.js"),
    mUtils = require("./matrixutils.js");
		
exports.getAppListPrefix = function(){
	return configs.appListPrefix;
}
exports.getAppsDir = function(){
	return path.join(process.cwd(), configs.appsFolder);
}
exports.getConfigFilename = function(){
	return configs.appDescriptionName;
}

exports.isInSubmenu = function(actual, requested){
	return mUtils.pathCompare(actual, requested);
}
exports.checkCompletion = function(statuses, list, response, submenu){
	for(var i in statuses){
		if(statuses[i] == 0){
			return;
		}
	}
	pageBuilder.createMenuPage(list, response, submenu);
}
exports.processItem = function(filePath, list, statuses, response, submenu){
	fs.stat(filePath, function(err, stats){
		if(err){
			statuses[filePath] = 1;
			exports.checkCompletion(statuses, list, response, submenu);
			return;	
		}
		if(stats.isDirectory()){
			fs.readdir(filePath, function(err, files){
				if(err){
					statuses[filePath] = 1;
					exports.checkCompletion(statuses, list, response, submenu);	
					return;
				}
				var indices = [];
				for(var i in files){
					var idx = path.join(filePath, files[i]);
					statuses[idx] = 0;
					indices.push(idx);	
				}
				for(var i in indices){
					exports.processItem(indices[i], list, statuses, response, submenu); 
				}
			});	
		} else if (stats.isFile()){
			if(mUtils.isManifest(filePath)){
				fs.readFile(filePath, function(err, data){
					if(err){
						statuses[filePath] = 1;
						exports.checkCompletion(statuses, list, response, submenu);	
						return;
					}
					var parsed = mUtils.parseManifestData(data, filePath);
					list.push(parsed);
				});
			}
		}
		statuses[filePath] = 1;
		exports.checkCompletion(statuses, list, response, submenu);
	});
}
exports.readFilesystemApps = function(subdir, response){
	var filePath = exports.getAppsDir();
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
				var appList = [];
				var statuses = [];
				var i = 0;
				for(var a in files){
					statuses[path.join(filePath, files[a])] = 0;
				}	
				for(var idx in files){
					exports.processItem(path.join(filePath, files[idx]), appList, statuses, response, subdir);
				}
			});
		});
	}); 
}
exports.generateAppList = function(uri, response){
	
	var wwwPrefix = exports.getAppListPrefix();
	var subdir = uri.substring(wwwPrefix.length);
	if(pageBuilder.hasCachedMenu(subdir)){
		console.log("using cached menu");
		pageBuilder.loadCachedMenu(subdir, response);
		return;
	}
	var appListCache = configs.cacheDir + configs.appListCacheFile;
	path.exists(appListCache, function(exists){
		if(exists){
			fs.readFile(appListCache, function(err, data){
				if(err){
					exports.readFilesystemApps(subdir, response);
					return;
				}
				console.log("using cached app list");
				var list = JSON.parse(data);		
				pageBuilder.createMenuPage(list, response, subdir);	
			});
		}else{
			exports.readFilesystemApps(subdir, response);	
		}
	});
	
}
