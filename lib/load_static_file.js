var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    configs = require("./configs.js");
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
  
 		        response.writeHead(200);  
            		response.write(file, "binary");  
            		response.end();  
        	});  
    });  
}
exports.load_static_file = function (uri, response) {  
    var filename = path.join(process.cwd(), uri);  
    exports.loadFileFromRoot(filename, response);
}
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
