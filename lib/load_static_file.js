/**
* Static file server for Matrix Gui
* @author Thomas Potthast <tpotthast@ti.com> 
* @fileOverview
*/
/**
* Static file serving
* @name loader
* @class 
*/
/**
* Public methods of loader
* @name exports
* @memberOf loader
*/
var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    configs = require("./configs.js");
/**
* Reads a file from the root of the filesystem and sends it back through response.
* @filename Name of file to load
* @param response HTTP response object
* @memberOf loader
*/
exports.loadFileFromRoot = function(filename, response){
	path.exists(filename, function(exists) {  
        	if(!exists) {  
        		response.writeHead(404, {"Content-Type": "text/plain"});  
       			response.write("404 Not Found\n");  
            		response.end();  
            		return;  
        	}  
  	        fs.readFile(filename, "binary", function(err, file) {  
  		        if(err) {  
        		        response.writeHead(500, {"Content-Type": "text/plain"});  
        		        response.write(err + "\n");  
       			        response.end();  
                		return;  
            		}  
  			var headers = [];
			var ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
			if(configs.cachableExtensions.indexOf(ext) != -1){
				headers = {
						"Cache-Control" : "max-age=36000"
					};
			} 
 		        response.writeHead(200, headers);  
            		response.write(file, "binary");  
            		response.end();  
        	});  
    });  
}
/**
* Loads a file from the matrix working directory or a subdir.
* @param uri File URI to load
* @param response HTTP response object
* @memberOf loader
*/
exports.load_static_file = function (uri, response) {  
    var filename = path.join(process.cwd(), uri);  
    exports.loadFileFromRoot(filename, response);
}
/**
* Loads an application icon. First checks to see if it is a path relative to the
* matrix folder, and if not, looks from the root of the filesystem.
* @param uri URI of the icon to load
* @param response HTTP response object to use to send the image
* @see loader.loadFileFromRoot
* @memberOf loader
*/
exports.loadIcon = function(uri, response){
	var filePath = uri.substring(configs.iconPrefix.length -1);
	var relativePath = path.join(process.cwd(), filePath);
	path.exists(relativePath, function(exists){
		if(!exists){
			exports.loadFileFromRoot(filePath, response);
		}else{
			exports.loadFileFromRoot(relativePath, response);
		}
	});
}  
