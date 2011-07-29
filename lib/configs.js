/**
* Configuration Settings for Matrix Gui
* @author Thomas Potthast <tpotthast@ti.com> 
* @fileOverview
*/
/**
* Configuration Settings (ignore the constructor) 
* @name configs
* @class 
*/
/**
* URL prefix used to tell that the request is for an app list.
* The app list is a JSON-encoded list of all the files in a submenu
* @memberOf configs
* @field
*/
exports.appListPrefix = "/applist/";

/**
* URL prefix used to tell that the request is for an app menu. The
* difference between a list and a menu is that a menu is fully 
* generated HTML instead of JSON. 
* @memberOf configs
* @field
*/
exports.appMenuPrefix = "/menu/";

/**
* URL prefix used to tell that the request is for an app description 
* page. The app description page is read, a menu bar is added, and it
* is returned as HTML
* @memberOf configs
* @field
*/
exports.appDescriptionPrefix = "/app/";

/**
* URL prefix used to tell that the request is for the full cache of app
* description pages. 
* @memberOf configs
* @field
*/
exports.allAppDescriptionsPrefix = "/appdescriptions/";

/**
* URL prefix used to tell that the request is to launch an application.
* @field
*/
exports.appLaunchPrefix = "/launch/";

/**
* URL prefix used to tell that the request is for an application.
* run output
* @memberOf configs
* @field
*/
exports.appOutputPrefix = "/output/";

/**
* URL prefix used to tell that the request is for an aplication icon.
* @field
*/
exports.iconPrefix = "/icons/";

/**
* URL prefix used to tell that the request is a request to clear the
* disk cache. 
* @memberOf configs
* @field
*/
exports.cacheClearPrefix = "/clearcache/";

/**
* URL prefix used to tell that the request is for an app run status.
* An app run status request gives the name of the output file and 
* whether or not the app is currently executing. (JSON encoded) 
* @memberOf configs
* @field
*/
exports.appStatusPrefix = "/appstatus/";

/**
* Valid extensions for an application icon. This is important because app 
* icons may be anywhere in the system. Icon requests contain the filepath
* of the file that they want, _relative_to_filesystem_root_. This means 
* that an app icon request could be used to get any file in the system 
* without this filter. Icon requests that do not match these extension fail
* with a permission denied error. 
* @memberOf configs
* @field
*/
exports.iconExtensions = [".png", ".svg", ".jpg"];

/**
* Extensions for which the Cache-control header will be set so that they
* will be cached client side. 
* @memberOf configs
* @field
*/
exports.cachableExtensions = [".png", ".gif", ".svg", ".jpg", ".html", ".js", ".css"];

/**
* Filetype of app description files
* @memberOf configs
* @field
*/
exports.appDescriptionName = ".desktop";

/**
* Folder where the apps are stored, relative to _server.js_, NOT this file. 
* @memberOf configs
* @field
*/
exports.appsFolder = "apps/";

/**
* Folder where images specific to matrix (TI logo, etc - not icons)  are stored. 
* This is relative to _Web_Server_ root, which is the matrix-gui-v2 folder. 
* @field
*/
exports.matrixImagesFolder = "/images/";

/**
* Folder where cache files are stored, relative to _server.js_, NOT this file. 
* @memberOf configs
* @field
*/
exports.cacheDir = "cache/";

/**
* Name of the file that will store the JSON apps list. It will be stored in cacheDir.
* @field
* @see exports.cacheDir
* @memberOf configs
*/
exports.appListCacheFile = "apps.json";

/**
* Name of the file that will store the JSON app descriptions. It will be stored in cacheDir.
* @field
* @see exports.cacheDir
* @memberOf configs
*/
exports.appDescriptionsCacheFile = "appDescriptions.json";

/**
* Location of the html template page for server side HTML generation.
* Path is relative to _server.js_ NOT this file
* @field
* @memberOf configs
*/
exports.htmlBasePageUrl = "baseHtml/index.html";
/**
* Location of the auto reloading html template page for server side HTML generation.
* Path is relative to _server.js_ NOT this file
* @field
* @memberOf configs
*/
exports.reloadBasePageUrl = "baseHtml/index_reload.html";

/**
* Path to JQuery, relative to the lib folder.  
* @field
* @memberOf configs
*/
exports.jqueryUrl = "./jquery/jquery-1.6.1.min.js";

/**
* Number of characters to use when generating pseudorandom ids for application runs. 
* @field
* @memberOf configs
*/
exports.appRunIdLength = 20;

/**
* Directory in which to store application's output and running files. Relative to server.js. 
* @field
* @memberOf configs
*/
exports.appOutputDir = "appOutput/";

/**
* Location to store locks, relative to server.js. Lock files may be specified by developers to 
* prevent multiples of the same application from running at the same time or to ensure that there
* aren't too many apps fighting for resources.  
* @field
* @memberOf configs
*/
exports.appLockDir = "locks/";

/**
* Extension for app lock files. They are stored as ${LOCK_NAME}.${appLockExtension} in appLockDir. 
* @see appLockDir 
* @field
* @memberOf configs
*/
exports.appLockExtension = ".lock";
/**
* HTML DOCTYPE used when generating HTML server side. 
* @field
* @memberOf configs
*/
exports.doctype = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
