var configs = require("./configs.js");
var fs = require("fs");
var path = require("path");
exports.parseManifestData = function(data, fpath){
	if(typeof(fpath) == 'undefined') fpath = "";
	var app = {
			"Application" : {
				"manifestPath" : fpath
			}
		};
	var lines = data.toString().split('\n');
	lines.forEach(function(line){
		var idx = line.indexOf("=");
		if(idx == -1){
			return;
		}
		var key = line.substring(0, idx);
		var value = line.substring(idx + 1);
		switch (key.toLowerCase()){
			case "type":
				if(value.toLowerCase() == "directory"){
					app.Application.appName = "Submenu";
				} 
			break;
			case "name":
				app.Application.title = value; 
			break;
			case "icon":
				app.Application.iconName = value;
			break;
			case "exec": 
				var ignored = [ "%f", "%F", "%U" , "%u", "%d", "%D", "%n", "%N", "%c", "%v", "%m"];
				for(var i in ignored){
					value = value.replace( ignored[i], "");
				}
				value = value.replace("%k", fpath);
				app.Application.appName = value;
			break;
			case "categories":
				app.Application.categories = value;
			break;
			case "x-matrix-categorytarget":
				app.Application.contents = value;
			break;
			case "x-matrix-lock":
				app.Application.lock = value;
			break;
			case "x-matrix-description":
				app.Application.appDesc = value;
			break;
			default:
				console.log("Unused key/value pair.");
				console.log("key: " + key);
				console.log("value: " + value);
			break;
		} 
	});
	console.log(JSON.stringify(app));
	return app;	
}
var cacheClearHelper = function(files, response, hasErr){
	var file = path.join(configs.cacheDir, files[files.length -1]);
	console.log("Deleting " +file); 
	fs.unlink(, function(err){
		files.pop();
		if(err) hasErr = true;
		if(files.length > 0){
			if(hasErr){
				response.writeHead(500);
				response.write("Files may not have been deleted");
				response.end();
			}else{
				response.writeHead(200);
				response.write("All files deleted");
				response.end();
			}		
		}else{
			clearCacheHelper(files, response, hasErr);
		}
	});
}
exports.clearCache = function(response){
	fs.readdir(configs.cacheDir, function(err, files){
		if(err){
			response.writeHead(500);
			response.write("Error reading Dir");
			response.end();
		}
		cacheClearHelper(files, response, false);
	});	
}
exports.appInSubmenu = function( appCats, submenuCats){
	var appCategories = exports.trim(appCats).split(";");
	var submenuCategories = exports.trim(submenuCats).split(";");
	for( var i in submenuCategories){
		if(appCategories.indexOf(submenuCategories[i]) != -1){
			return true;
		}
	}
	return false;
}
exports.cleanStr = function(str){
	var beginIdx = str.indexOf("/");
	var endIdx = str.lastIndexOf("/");
	beginIdx = Math.max(beginIdx, 0);
	endIdx = (endIdx == -1) ? str.length : endIdx;
	str = str.substring(beginIdx, endIdx - beginIdx);
	return str;
}
exports.trim = function(str){
	var	str = str.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}
exports.getExtension = function(filename){
	return filename.substring(filename.lastIndexOf("."));
}
exports.isManifest = function(filename){
	var extension = exports.getExtension(filename);
	if(extension.toLowerCase() == configs.appDescriptionName.toLowerCase()){
		console.log("Manifest found: " + filename);
		return true;
	}
	console.log(filename + " is not a manifest");
	return false;
}
exports.pathCompare = function(actual, requested){
	//drop leading and trailing slashes on both
	actual = mUtils.cleanStr(actual);
	requested = mUtils.cleanStr(requested);
	
	//both to lower case; used for case insensitive comparison
	actual = actual.toLowerCase();
	requested = requested.toLowerCase();
	return actual == requested;
}
exports.checkPrefix = function(uri, prefix){
	var check = uri.substring(0, prefix.length);
	if( check === prefix){
		return true;
	}
	return false;
}
exports.isAppListRequest = function(uri){
	return exports.checkPrefix(uri, configs.appListPrefix);
}
exports.isAppDescriptionRequest = function(uri){
	return exports.checkPrefix(uri, configs.appDescriptionPrefix);
}
exports.isAppIconRequest = function(uri){
	return exports.checkPrefix(uri, configs.iconPrefix) && configs.iconExtensions.indexOf(exports.getExtension(uri)) != -1;
}
exports.isCacheClearRequest = function(uri){
	return exports.checkPrefix(uri, configs.cacheClearPrefix);
}
exports.getAppIdFromUri = function(uri){
	 return uri.substring(uri.lastIndexOf("/") +1);
}
