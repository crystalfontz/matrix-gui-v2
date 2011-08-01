/**
* Utility functions for Matrix GUI
* @author Thomas Potthast <tpotthast@ti.com> 
* @fileOverview
*/
/**
* Application execution and output capture 
* @name mUtils
* @class 
*/
var configs = require("./configs.js");
var fs = require("fs");
var path = require("path");
/**
* Chacks to see if the required matrix folders exist. If not, it creates them.
* @see configs.exports.cacheDir
* @see configs.exports.appOutputDir
* @see configs.exports.appLockDir
* @memberOf mUtils
*/
exports.checkDirs = function(){
	var dirs = [];
	dirs.push(configs.cacheDir);
	dirs.push(configs.appOutputDir);
	dirs.push(configs.appLockDir);
	dirs.forEach(function(dir){
		path.exists(dir, function(exists){
			if(!exists){
				console.log("Creating" + dir);
				fs.mkdir(dir, "0777", function(){});
			}
		});
	});
}
//app list generation
/**
* Parses properly formatted data according to the freedesktop.org spec into the 
* internal JSON representation used by Matrix. 
* @param data String data to parse
* @param fpath Path to manifest file
* @see http://standards.freedesktop.org/desktop-entry-spec/latest/
* @memberOf mUtils
*/
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
	if(app.Application.hasOwnProperty("appName")){
		app.Application.appName = app.Application.appName.replace("%i", "--icon " + app.Application.iconName);
	}
	app.Application.path64 = new Buffer(app.Application.manifestPath).toString("base64");
	return app;	
}
/**
* Determines if an application belongs in the submenu with the specified category.
* Category "*" returns true for all apps, and an empty string will be true if the 
* application has no categories.  
* @param app Application to check
* @param submenuCats Categories (semicolon separated) of apps to accept. 
* @memberOf mUtils
*/
exports.isInSubmenu = function(app, submenuCats){
	if(submenuCats.indexOf("*") != -1){
		return true;
	}
	if(submenuCats == "" && !app.hasOwnProperty("categories")){
		return true;
	}else if(!app.hasOwnProperty("categories")){
		return false;
	}	
	var appCats = app.categories.toLowerCase().split(";");
	var sCats = submenuCats.toLowerCase().split(";");
	for(var i in sCats){
		for(var j in appCats){
			if(sCats[i] == appCats[j]){
				return true;
			}
		}
	}
	return false;
}
/**
* App Sorting helper. Compares apps first by sortPriority, and then alphabetically.
* Apps with a lower sortPriority will appear before ones with higher or no sortPriority.
* @param app1 first app to check 
* @param app2 second app to check
* @memberOf mUtils
*/
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
/**
* Recursively deletes files in configs.exports.cacheDir. When the last file is deleted, writes output to response.
* @param files list of files to delete
* @param response HTTP response object
* @param hasErr Whether or not an error in deletion has already occurred
* @see configs.exports.cacheDir
* @see mUtils.exports.clearCache
* @private
* @memberOf mUtils
*/
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
/**
* Deletes all apps in configs.exports.cacheDir. 
* @param response HTTP response used for output
* @see configs.exports.cacheDir
* @see mUtils.cacheClearHelper
* @memberOf mUtils
*/
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
/**
* Wrapper to make outputting JSON to a response easier.
* @param js JSON to write
* @param response HTTP response object
* @memberOf mUtils
*/
exports.writeJSON = function(js, response){
	response.writeHead(200, {"Content-Type" : "text/json" });
	response.write(JSON.stringify(js));
	response.end();
}
//String functions
/**
* Removes leading and trailing slashes.
* @param str String to clean
* @memberOf mUtils
*/
exports.cleanStr = function(str){
	var beginIdx = str.indexOf("/");
	var endIdx = str.lastIndexOf("/");
	beginIdx = Math.max(beginIdx, 0);
	endIdx = (endIdx == -1) ? str.length : endIdx;
	str = str.substring(beginIdx, endIdx - beginIdx);
	return str;
}
/**
* Removes whitespace from a string.
* @param str String to clean
* @memberOf mUtils
*/
exports.trim = function(str){
	var	str = str.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}
/**
* Escapes unsafe HTML characters in text. Replaces &<>"' with their equivalents.
* @param unsafe string to clean
* @memberOf mUtils
*/
exports.escapeHtml = function(unsafe) {
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
/**
* Generates a random alphanumeric (and _ ) string of the specified length.
* @param len Length of string to generate
* @memberOf mUtils
*/
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
/**
* Gets the extension of a file.
* @param filename full name of file
* @memberOf mUtils
*/
exports.getExtension = function(filename){
	return filename.substring(filename.lastIndexOf("."));
}
/**
* Checks whether or not a file is a manifest. Currently just looks at the extension. 
* @param filename name of file to check
* @memberOf mUtils
*/
exports.isManifest = function(filename){
	var extension = exports.getExtension(filename);
	if(extension.toLowerCase() == configs.appDescriptionName.toLowerCase()){
		return true;
	}
	return false;
}
/**
* Compares whether or not two paths are the same, ignoring leading and trailing slashes. 
* Case insensitive. 
* @param path1 first path to check
* @param path2 second path to check
* @memberOf mUtils
*/
exports.pathCompare = function(path1, path2){
	//drop leading and trailing slashes on both
	path1 = mUtils.cleanStr(path1);
	path2 = mUtils.cleanStr(path2);
	
	//both to lower case; used for case insensitive comparison
	path1 = path1.toLowerCase();
	path2 = path2.toLowerCase();
	return path1 == path2;
}
/**
* Checks to see if uri has a given prefix.
* @param uri Uri to check
* @param prefix Prefix for which to look
* @memberOf mUtils
*/
exports.checkPrefix = function(uri, prefix){
	var check = uri.substring(0, prefix.length);
	if( check === prefix){
		return true;
	}
	return false;
}
//URI checking functions
/**
* Determines whether or not URI is a request for the app list.
* @param uri URI to check
* @see mUtils.exports.checkPrefix
* @see configs.exports.appListPrefix
* @memberOf mUtils
*/
exports.isAppListRequest = function(uri){
	return exports.checkPrefix(uri, configs.appListPrefix);
}
/**
* Determines whether or not URI is a request for the app menu.
* @param uri URI to check
* @see mUtils.exports.checkPrefix
* @see configs.exports.appMenuPrefix
* @memberOf mUtils
*/
exports.isAppMenuRequest = function(uri){
	return exports.checkPrefix(uri, configs.appMenuPrefix);
}
/**
* Determines whether or not URI is a request for an app description page. 
* @param uri URI to check
* @see mUtils.exports.checkPrefix
* @see configs.exports.appDescriptionPrefix
* @memberOf mUtils
*/
exports.isAppDescriptionRequest = function(uri){
	return exports.checkPrefix(uri, configs.appDescriptionPrefix);
}
/**
* Determines whether or not URI is a request for an app icon. Only returns true if
* the uri is for a valid icon filetype. 
* @param uri URI to check
* @see mUtils.exports.checkPrefix
* @see configs.exports.iconPrefix
* @see configs.exports.iconExtensions
* @see mUtils.exports.getExtension
* @memberOf mUtils
*/
exports.isAppIconRequest = function(uri){
	return exports.checkPrefix(uri, configs.iconPrefix) && configs.iconExtensions.indexOf(exports.getExtension(uri)) != -1;
}
/**
* Determines whether or not URI is a request to launch an app.
* @param uri URI to check.
* @see mUtils.exports.checkPrefix
* @see configs.exports.appLaunchPrefix
* @memberOf mUtils
*/
exports.isAppLaunchRequest = function (uri){
	return exports.checkPrefix(uri, configs.appLaunchPrefix);
}
/**
* Determines whether or not URI is a request to clear the cache folders.
* @param uri URI to check.
* @see mUtils.exports.checkPrefix
* @see configs.exports.cacheClearPrefix
* @memberOf mUtils
*/
exports.isCacheClearRequest = function(uri){
	return exports.checkPrefix(uri, configs.cacheClearPrefix);
}
/**
* Determines whether or not URI is a request for the app list.
* @param uri URI to check.
* @see mUtils.exports.checkPrefix
* @see configs.exports.appOutputPrefix
* @memberOf mUtils
*/
exports.isAppOutputRequest = function(uri){
	return exports.checkPrefix(uri, configs.appOutputPrefix);
}
/**
* Determines whether or not URI is a request for an application's 
* status.
* @param uri URI to check
* @see mUtils.exports.checkPrefix
* @see configs.exports.appStatusPrefix
* @memberOf mUtils
*/
exports.isAppStatusRequest = function (uri){
	return exports.checkPrefix(uri, configs.appStatusPrefix);
}
/**
* Determines whether or not URI is a request for the full set of 
* application descriptions.
* @param uri URI to check
* @see mUtils.exports.checkPrefix
* @see configs.exports.allAppDescriptionsPrefix
* @memberOf mUtils
*/
exports.isAllAppDescriptionsRequest = function(uri){
	return exports.checkPrefix(uri, configs.allAppDescriptionsPrefix);
}
/**
* Gets an application ID from a URI.
* @param uri URI to parse
* @memberOf mUtils
*/
exports.getAppIdFromUri = function(uri){
	 return uri.substring(uri.lastIndexOf("/") +1);
}
/**
* Converts a filepath to an app ID.
* @param filepath Filepath to convert
* @memberOf mUtils
*/
exports.getAppIdFromFilepath = function(filepath){
	return new Buffer(filepath).toString("base64")
}
/**
* Converts an app ID to a filepath. 
* @param id ID to convert
* @memberOf mUtils
*/
exports.getAppPathFromId = function(id){
	return new Buffer(id, "base64").toString("ascii")
}
//app filenames
/**
* Determines the output filename given an application run's ID. 
* @param id ID of the application run whose information is requested
* @see configs.exports.appOutputDir
* @memberOf mUtils
*/
exports.getAppOutputFilename = function (id){
	return path.join(configs.appOutputDir, id) + ".txt";
}
/**
* Determines the name of an application's running status file given 
* an application run's ID. 
* @param id ID of the application run whose information is requested
* @see configs.exports.appOutputDir
* @memberOf mUtils
*/
exports.getRunningFilename = function(id){
	return path.join(configs.appOutputDir, id) + ".running";
}
