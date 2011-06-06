var fs = require("fs"),
    sys = require("sys"),
    path = require("path");
exports.getAppListPrefix = function(){
	return "/applist/";
}
exports.getAppsDir = function(){
	return path.join(process.cwd(), "bin/");
}
exports.getConfigFilename = function(){
	return "MANIFEST.json";
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
	console.log(uri);
	var prefix = exports.getAppListPrefix();
	if(uri.substring(0, prefix.length) === prefix){
//		console.log("App List request Found");
		return true;
	}
	return false;
}
exports.checkCompletion = function(statuses, list, response){
	for(var i in statuses){
		if(statuses[i] == 0){
			return;
		}
	}
	response.writeHead(200, {"Content-Type": "text/plain"});
       	response.write(JSON.stringify(list));
       	response.end();
}
exports.processManifest = function(fPath, list, idx, statuses, response, submenu){
	var configFile = path.join(fPath, exports.getConfigFilename());
//	console.log("Config file: " + configFile);
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
			processed = JSON.parse(data);
			processed.Application.manifestPath = configFile;
			//console.log(processed);
			if(processed.Application.hasOwnProperty("submenu")){
				if(exports.isInSubmenu(processed.Application.submenu, submenu)){
					list.push(processed);
				}
			}else if(submenu == ""){
				list.push(processed);
			}					
			statuses[idx] = 1;
			exports.checkCompletion(statuses, list, response);
		});	
	});
}
exports.generateAppList = function(uri, response){
	var filePath = exports.getAppsDir();
	var wwwPrefix = exports.getAppListPrefix();
	var subdir = uri.substring(wwwPrefix.length);
//	console.log("Generating path for " + filePath);

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
