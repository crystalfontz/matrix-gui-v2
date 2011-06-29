var configs = require("./configs.js");
var fs = require("fs");
var path = require("path");
//App List generation
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
				app.Application.appDescription = value;
			break;
			case "x-matrix-displaypriority":
				app.Application.sortPriority = value;
			break;
			case "comment":
				app.Application.comment = value;
			break;
			default:
			/*      console.log("Unused key/value pair.");
				console.log("key: " + key);
				console.log("value: " + value); */
			break;
		} 
	});
	return app;	
}
exports.appInSubmenu = function( appCats, submenuCats){
	submenuCats = exports.cleanStr(submenuCats).toLowerCase();
	var appCategories = exports.trim(appCats.toLowerCase()).split(";");
	var submenuCategories = exports.trim(submenuCats).split(";");
	for( var i in submenuCategories){
		if(appCategories.indexOf(submenuCategories[i]) != -1){
			return true;
		}
	}
	return false;
}
exports.compareApps = function(app1, app2){
	var has1 = app1.Application.hasOwnProperty("sortPriority");
	var has2 = app2.Application.hasOwnProperty("sortPriority");
	if(has1 && ! has2){
		return -1;
	}
	if(has2 && !has1){
		return 1;
	}
	if(!has1 && ! has2){
		var n = (app2.Application.title<app1.Application.title)-(app1.Application.title<app2.Application.title);
		return n; 
	}
	var p1 = app1.Application.sortPriority;
	var p2 = app2.Application.sortPriority; 
	return p1 - p2;
}
var cacheClearHelper = function(files, response, hasErr){
	var file = path.join(configs.cacheDir, files[files.length -1]);
	fs.unlink(file, function(err){
		files.pop();
		if(err) hasErr = true;
		if(files.length <= 0){
			response.writeHead(302, {"Content-Type": "text/html", "Location" : configs.cacheBuilderUrl});
			if(hasErr){
				response.write("Files may not have been deleted");
			}else{
				response.write("All files deleted");
			}
			response.end();		
		}else{
			cacheClearHelper(files, response, hasErr);
		}
	});
}
exports.clearCache = function(response){
	fs.readdir(configs.cacheDir, function(err, files){
		if(err){
			response.writeHead(500, {"Content-Type": "text/html"});
			response.write("Error reading Dir");
			response.end();
		}
		console.log("Clearing Cache");
		cacheClearHelper(files, response, false);
	});	
}
//String functions
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
exports.escapeHtml = function(unsafe) {
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

exports.randomString = function(len){
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz_";
	var randomstring = '';
	for (var i=0; i<len; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}
//Filename utils
exports.getExtension = function(filename){
	return filename.substring(filename.lastIndexOf("."));
}
exports.isManifest = function(filename){
	var extension = exports.getExtension(filename);
	if(extension.toLowerCase() == configs.appDescriptionName.toLowerCase()){
		return true;
	}
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
//URI check
exports.isAppListRequest = function(uri){
	return exports.checkPrefix(uri, configs.appListPrefix);
}
exports.isAppDescriptionRequest = function(uri){
	return exports.checkPrefix(uri, configs.appDescriptionPrefix);
}
exports.isAppIconRequest = function(uri){
	return exports.checkPrefix(uri, configs.iconPrefix) && configs.iconExtensions.indexOf(exports.getExtension(uri)) != -1;
}
exports.isAppLaunchRequest = function (uri){
	return exports.checkPrefix(uri, configs.appLaunchPrefix);
}
exports.isCacheClearRequest = function(uri){
	return exports.checkPrefix(uri, configs.cacheClearPrefix);
}
exports.isAppOutputRequest = function(uri){
	return exports.checkPrefix(uri, configs.appOutputPrefix);
}
exports.getAppIdFromUri = function(uri){
	 return uri.substring(uri.lastIndexOf("/") +1);
}
exports.getAppIdFromFilepath = function(filepath){
	return new Buffer(filepath).toString("base64")
}
exports.getAppPathFromId = function(id){
	return new Buffer(id, "base64").toString("ascii")
}
//app filenames
exports.getAppOutputFilename = function (id){
	return path.join(configs.appOutputDir, id) + ".txt";
}
exports.getRunningFilename = function(id){
	return path.join(configs.appOutputDir, id) + ".running";
}
