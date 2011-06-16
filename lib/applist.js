var fs = require("fs"),
    sys = require("sys"),
    path = require("path"),
    pageBuilder = require("./pageBuilder.js"),
    configs = require("./configs.js");
		
exports.getAppListPrefix = function(){
	return configs.appListPrefix;
}
exports.getAppsDir = function(){
	return path.join(process.cwd(), configs.appsFolder);
}
exports.getConfigFilename = function(){
	return configs.appDescriptionName;
}
exports.cleanStr = function(str){
	var beginIdx = str.indexOf("/");
	var endIdx = str.lastIndexOf("/");
	beginIdx = Math.max(beginIdx, 0);
	endIdx = (endIdx == -1) ? str.length : endIdx;
	str = str.substring(beginIdx, endIdx - beginIdx);
	return str;
}
exports.isInSubmenu = function(actual, requested){

	//drop trailing slashes on both
	actual = exports.cleanStr(actual);
	requested = exports.cleanStr(requested);
	
	//both to lower case; used for case insensetive comparison
	actual = actual.toLowerCase();
	requested = requested.toLowerCase();
	return actual == requested;
}
exports.isAppListRequest = function(uri){
	var prefix = exports.getAppListPrefix();
	var check = uri.substring(0, prefix.length);
	if( check === prefix){
		console.log("app list request found");
		return true;
	}
	return false;
}
exports.checkCompletion = function(statuses, list, response, submenu){
	for(var i in statuses){
		if(statuses[i] == 0){
			return;
		}
	}
/*
	response.writeHead(200, {"Content-Type": "text/plain"});
       	response.write(JSON.stringify(list));
       	response.end();
*/
	console.log("building menu");
	pageBuilder.createMenuPage(list, response, submenu);
}
exports.processManifest = function(fPath, list, idx, statuses, response, submenu){
	var configFile = path.join(fPath, exports.getConfigFilename());
	var processed;
	path.exists(configFile, function(exists){
		if(!exists){
			statuses[idx] = 1;
			exports.checkCompletion(statuses, list, response);
			return;
		}
		fs.readFile(configFile, function(err, data){
			if(err){
				statuses[idx] = 1;
				exports.checkCompletion(statuses, list, response);
				return;
			}
			try{ //otherwise one bad manifest will take down the server
				processed = JSON.parse(data);
				processed.Application.manifestPath = configFile;
				if(processed.Application.hasOwnProperty("submenu")){
					if(exports.isInSubmenu(processed.Application.submenu, submenu)){
						list.push(processed);
					}
				}else if(submenu == ""){
					list.push(processed);
				}
			}catch(e){
				console.log("Invalid manifest at: " + configFile);
				console.log("File Data: \n" + data);
			}					
			statuses[idx] = 1;
			exports.checkCompletion(statuses, list, response, submenu);
		});	
	});
}
exports.generateAppList = function(uri, response){
	var filePath = exports.getAppsDir();
	var wwwPrefix = exports.getAppListPrefix();
	var subdir = uri.substring(wwwPrefix.length);
	if(pageBuilder.hasCachedMenu(subdir)){
		console.log("Using Cached Menu");
		pageBuilder.loadCachedMenu(subdir, response);
		return;
	}
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
				//console.log(files);
				for(var a in files){
					statuses[a] = 0;
				}	
				for(var idx in files){
					var item = exports.processManifest(path.join(filePath, files[idx]), appList,idx,  statuses, response, subdir);
				}
			});
		});
	}); 
}
