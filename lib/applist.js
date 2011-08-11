/**
* App list and description list generator for Matrix Gui
* @author Thomas Potthast <tpotthast@ti.com> 
* @fileOverview
*/
/**
* App list and description list generator
* @name applist
* @class 
*/
/**
* Public methods of applist
* @name exports
* @memberOf applist
*/
var fs = require("fs"),
    sys = require("sys"),
    path = require("path"),
    configs = require("./configs.js"),
    mUtils = require("./matrixutils.js");
/**
* Holds lists of apps. Each submenu has its own list of apps, which are 
* stored indexed by submenu. The structure is a 2D associative array. 
* @private
* @field
* @memberOf applist
*/
var appList = {};
/**
* Tracks status of manifests being processed. As a manifest is found in the 
* file system, it is given an entry, indexed by filepath, reflecting that it
* is not complete (0). When a manifest is done being processed, the entry is
* changed to reflect that it is done processing (value of 1). When all entries
* for a given submenu are done, the app list for that submenu has been created. 
* This is necessary because of the way Node handles I/O - when looping through
* reaching the last one does not mean all the files have been read when the 
* last one is read.
* @private 
* @field
* @memberOf Applist
*/
var appListStatuses = {};
/**
* Holds lists of application descriptions. Each submenu has its own set 
* of app description, which is stored as an array indexed by submenu
* name. Thus, it is an associative 2D array. 
* @private
* @field 
* @memberOf applist
*/ 
var appDescriptions = {};
/**
* Stores the app list to the cache file. JSON.stringify is used to convert the
* Array for storage. 
* @see applist.appList
* @see configs.exports.cacheDir
* @see configs.exports.appListCacheFile 
* @private
* @memberOf applist
*/
var saveAppList = function(){
	var appListCache = configs.cacheDir + configs.appListCacheFile;
	fs.writeFile(appListCache, JSON.stringify(appList), function(err){
		if(err){
			console.log("Error making app list cache");
		}
	});
}
/**
* Stores the app descriptions to the cache file. Also uses JSON.stringify.
* @see applist.appDescriptions
* @see configs.exports.appDescriptionsCacheFile
* @see configs.exports.cacheDir
* @private 
* @memberOf applist
*/
var saveAppDescriptions = function(){
	var appDescCache = configs.cacheDir + configs.appDescriptionsCacheFile;
	fs.writeFile(appDescCache, JSON.stringify(appDescriptions), function(err){
		if(err){
			console.log("Error making app description cache");
		}
	});
}
/**
* Checks to see if all the files are done being processed, and if so 
* executes the callback function with the sorted app list, then saves
* it. 
* @param response HTTP response object
* @param submenu The requested submenu
* @param callback The function to execute with the complete app list
* @see applist.appListStatuses
* @see applist.saveAppList
* @memberOf applist
*/
exports.checkCompletion = function(response, submenu, callback){
	for(var i in appListStatuses[submenu]){
		if(appListStatuses[submenu][i] == 0){
			return;
		}
	}
	callback(appList[submenu].sort(mUtils.compareApps), response, submenu);
	saveAppList();
}
/**
* Takes an item in the filesystem (file/directory) and analyzes it. If it is 
* a directory, its contents are read and passed to processItem. If it is a
* file, it is checked to see if it is a manifest. If it is, it is read and
* parsed into the applist. If it is not, it is ignored. 
* {@link applist.exports.checkCompletion} is run after every item. 
* @param filePath Path to the item to analyze
* @param response HTTP response object
* @param submenu Current submenu being generated
* @param callback The function to execute with the complete app list
* @see applist.appList
* @see applist.exports.checkCompletion
* @see applist.appListStatuses
* @see mUtils.exports.isManifest
* @see mUtils.exports.parseManifestData
* @memberOf applist
*/
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
/**
* Reads and parses manifests from the filesystem. It first checks to
* make sure the apps dir exists and is a directory, then scans it 
* and hands its contents off to {@link applist.exports.processItem}. 
* @param submenu The current submenu being generated
* @param response HTTP Response object
* @param callback Function to execute with the generated app list
* @see configs.exports.appsFolder
* @see applist.appListStatuses
* @see applist.exports.processItem
* @memberOf applist
*/
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
				response.write("Invalid App location\n");
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
* Generates the list of applications for a given submenu. First checks 
* { @link applist.appList } to see if the requested menu has been 
* generated, and then checks the disk cache file (located at
* {@link configs.exports.cacheDir} { @link configs.exports.appListCacheFile}).
* If not, it calls { @link applist.exports.readFilesystemApps} to generate
* the list.
* @param submenu The requested submenu
* @param response HTTP response object    
* @param callback function to call with the generated app list. Should 
* be of the form function (list, response, submenu)
* @see applist.appList
* @see configs.exports.cacheDir
* @see configs.exports.appListCacheFile
* @see applist.exports.readFilesystemApps
* @memberOf applist
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
/**
* Takes the app list and processes it to generate the list of app descriptions. 
* Each application is checked to see if it specifies a description page. If it 
* does, that description page is read, processed, and added to the set of 
* descriptions. If not, it is then checked for a comment. If it has a comment,
* that is then used as the description and put into the set. Finally, if it has
* neither a description nor a comment, it is given a description of "No description
* provided". Errors in any step will result in the appropriate error message being 
* used as the description. Note that this function is passed as a callback to 
* { @link applist.exports.generateAppList}, hence the name. 
* @param list generated app list for the submenu
* @param response HTTP Response object
* @param submenu Currently generated submenu       
* @memberOf applist
*/
var appDescriptionCallback = function(list, response, submenu){
	appDescriptions[submenu] = {};

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
/***
* Clears the app list and description list, so that it will be regenerated. 
* @memberOf applist
*/
exports.clear = function(){
	appDescriptions = {};
	appList = {};
}
/**
* Generates the app description set for all apps. URI is currently ignored, 
* although in the future it could be used to generate the app descriptions
* for a submenu. It checks { @link applist.appDescriptions} to see if it 
* contains the main appdescription list, and if so immediately returns it. 
* It will then check disk cache (Located at {@link configs.exports.cacheDir}/
* {@link configs.exports.appDescriptionsCacheFile). If it has the main cache,
* it will then send that and store it into {@link applist.appDescriptions}. 
* If neither of those are the case, it will use {@link applist.exports.generateAppList}
* with {@link applist.exports.appDescriptionCallback} as a callback to generate
* and then send the set of descriptions.
* @param uri Request URI. Currently ignored, but may be used later for app 
* descriptions for only a specific submenu.
* @param response HTTP response object    
* @memberOf applist
*/
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
