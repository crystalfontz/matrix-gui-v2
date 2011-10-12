/** App list from server. JSON Encoded array. 
* @field			
*/			
var apps = [];

/** Generated html description pages and apps in submenus 
* @field			
*/
var cache = []; 

/** Default number of apps on each page. Recalculated based on screen dims.  
* @field			
*/
var appsPerPage = 10;

/** Div representing the current page being built 
* @field			
*/
var currentPage = false;

/** number of apps that have been added to the current page 
* @field			
*/
var currentAppNum = 0; 

/** unix timestamp (ms) of last time a swipe was responded to 
* @field			
*/
var lastSwipeTime = 0; 

/** Amount of time to wait between responding to swipes  
* @field			
*/
var swipeInterval = 800; 

/** number of pages in the current menu 
* @field			
*/

var nPages = 0; 
/** Index of the currently showing page 
* @field			
*/
var showingPage = 0;

/** Height offset to which to scroll  
* @field			
*/
var scrollLoc = 0; 

/** Whether or not a menu swipe is allowed to occur.
* @field			
*/
var allowPageSwipe = true;

/** Set to true for screen height < 400 
* @field			
*/ 
var smallScreen = false;

/** used when manually rebuilding cache 
* @field			
*/
var appsLoaded = 0; 

/** Disables select in most browsers when combined with css. 
* @param target Element to apply styles to
*/
var disableSelect = function( target )
{
	if(typeof target == "string"){
		target = document.getElementById(target);
	}
	if (typeof target.onselectstart!="undefined"){
		target.onselectstart=function(){return false};
	}else if (typeof target.style.MozUserSelect!="undefined"){
		target.style.MozUserSelect="none";
	}else{
		target.onmousedown=function(){return false}
		target.style.cursor = "default";
	}
}

/** Gets a parameter with the given name from the URL, or "" if it is not set. 
* @param name Name of parameter whose value to find. 			
*/
var getUrlParam = function ( name ) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null ) {
		return "";
	}else{
	    return results[1];
	}
}

/** Computes the available height in which to display apps. */
var getViewportHeight = function(){
	return $(window).height() -$("#navHeader").height();
}

/** Strips generated html from app description pages. Used in manual cacheing 
* @param data the generated html to clean
*/
var cleanAppPage = function(data){
	//HACK. This needs to be better implemented
	//It's almost completely worked around by requesting the cache up front.
	var start = data.indexOf('outputDiv') + "outputDiv".length + 2;
	var end = data.indexOf('/body') - 1;
	return data.substring(start, end);
}

/**
* Determines whether or not an app belongs in a submenu with the given categories
* @param app JSON encoded application description
* @param submenuCats semicolon-separated list of categories to be displayed.
* if any of an app's categories (also semicolon-separated) match any of the categories to
* be displayed, returns true.
*/
var isInSubmenu = function(app, submenuCats){
	//! No categories set for the app mean show in root submenu ("") only
	if(submenuCats == "" && !app.hasOwnProperty("categories")){
		return true;
	}else if(!app.hasOwnProperty("categories")){
		return false;
	}
	//! Case insensitive	
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
* Queries the server to see the status of an application.
* Updates the output with the current status of the application, then, if
* the application is still running, reschedules itself to run in a half-second.
* Note that the main menu button is hidden until the application has finished
* execution. 
* @param id the id of the RUN to check. Note that this is NOT the same as
* an application's ID. Each run of each app recieves a new, 20-char random
* alphanumeric id. 
*/
var updateAppStatus = function (id, hasOutput){
	var path = "/appstatus/" + id;
	$.getJSON(path, function(data){
		if(hasOutput){
			$("#apps").empty();
			var container = document.createElement("div");
			$(container).addClass("outputDiv");
			$(container).attr("id", "outputDiv");
			var p = document.createElement("pre");
			if(data.output != ""){
				$(p).html(data.output);
			}else{
				$(p).html("Application started, waiting for output.");
			}
			$(container).append(p);
			$("#apps").append(container);
			var bookend = document.createElement("div");
			$(bookend).attr("id", "bookend");
			$("#apps").append(bookend);
			var tgt = $(bookend);
			$('html,body').animate({scrollTop: tgt.offset().top}, 500);
			addOutputSwipe();
			$("#mainMenuBtn").css("display", "none");
		}
			
		if(data.running == false){
			if(hasOutput){
				$("#mainMenuBtn").css("display", "block");
			}else{
				buildMenu("");
			}
		}else{
			setTimeout(function(){updateAppStatus(id, hasOutput);}, 500);
		}
	});
}

/** Launches an application on the server 
* @param app Application (full JSON representation) to launch
*/
var launchApp = function(app){
	$.getJSON("/launch/" + app.path64, function(data, status){
		console.log(app);
		if(!data.hasOwnProperty("failure")){
			$("#mainMenuBtn").css("display", "none");
			var hasOutput = true;
			if(app.hasOwnProperty("terminal") &&  app.terminal == false){
				hasOutput = false;
			}
			setTimeout(function(){updateAppStatus(data.id, hasOutput);}, 500);
		}else{
		$("#runDiv").text(data.failure);
		}
	});
	$("#mainMenuBtn").css("display", "block");
}

/**
* Updates which arrows are showing (Left/right).This is based on the number 
* of the currently showing page. 0 is the furthest 
* left, nPages is the furthest right.
* @see nPages
*/
var updateArrows = function(){
	if(showingPage == 0){
		$("#leftArrow").css("display", "none");
	}else{
		$("#leftArrow").css("display", "block");
	}
	if(showingPage == nPages -1){
		$("#rightArrow").css("display", "none");
	}else{
		$("#rightArrow").css("display", "block");
	}
} 

/**
* Sets the currently showing page to showingPage.
* @see updateArrows
* @see showingPage
*/
var updatePages = function(){
	$(".page").css("display", "none");
	$("#page_"+ showingPage).css("display", "block");
	updateArrows();
}
 
/**
* Goes to the next (immediate right) page. 
* @see showingPage
* @see nPages
* @see updatePages
*/
var nextPage = function(){
	if(showingPage < nPages -1){
		showingPage ++;
		updatePages();
	}
}
 
/**
* Goes to the previous (immediate left) page	
* @see showingPage
* @see nPages
* @see updatePages
*/
var prevPage = function(){
	if(showingPage > 0){
		showingPage --;
	updatePages();
	}
}

/** Adds a new page to the current menu. Also sets up the proper 
* css and id, as well as setting currentPage.
* used by addApp
* @see currentPage
* @see addApp
*/
var addPage = function(){
	currentPage = document.createElement("div");
	$(currentPage).addClass("page");
	$(currentPage).addClass("single");
	$(currentPage).attr("id", "page_" + nPages);
	$(currentPage).css("height", getViewportHeight());
	if(nPages != 0){
		$(currentPage).css("display", "none");
	}
	$("#menu").append(currentPage);
	currentAppNum = 0;
	nPages++;
}

/**
* Displays an application on the screen. If there is enough space on the 
* current page (as determined by currentAppNum), it is added to the current 
* page. Otherwise, a new page is created and it is added there. 
* @param app JSON encoded application representation
* @see addPage
* @see currentPage
* @see apps 
*/
var addApp = function (app){
	var container = document.createElement("div");
	var icon = document.createElement("img");
	icon.src = "/icons" + app.iconName;
	$(icon).addClass("app_icon");
	$(icon).attr("alt", "[ " + app.title + " ]"); 
	var t = document.createElement("p");
	$(t).text(app.title);
	$(t).addClass("appTitle");
	disableSelect(t);				
	$(container).addClass("base");
	$(container).addClass("appContainer");
	if(app.appName == "Submenu"){
		$(icon).click( function(){
				buildMenu(app.contents)
			});
	}else{
		$(icon).click( function(){
			showAppDescription(app);
		});
	}
	$(container).append(icon);
	$(container).append(t);
	if(currentPage == false || currentAppNum >= appsPerPage){
		addPage();
	}
	$(currentPage).append(container);
	currentAppNum++;
}

/**
* Adds the run button to a showing app description page. Note that this 
* is only done if the application actually has an executable
* @param app the application to launch when the button is clicked
* @see launchApp
* @see addDescriptionExtras
* @see showAppDescription
*/
var addRunBtn = function(app){
	$("#apps .runDiv").remove();
	if(app.hasOwnProperty("appName") && app.appName != ""){
		var runDiv = document.createElement("div");
		$(runDiv).addClass("runDiv");
		$(runDiv).attr("id", "runDiv");
		var runImg = document.createElement("img");
		$(runImg).attr("src", "/images/run-icon.png");
		$(runImg).addClass("runImg");
		$(runImg).attr("alt", "Run app");
		$(runDiv).append(runImg);
		$(runDiv).click(function(){
			$(runDiv).empty();
			$(runDiv).text("Launching Application");
			launchApp(app);
		});
		disableSelect(runDiv);
		$("#apps").append(runDiv);
	}
}

/**
* Adds run button and bookend to app description page.
* the bookend is used when scrolling application output
* @param app application to launch 
* @see addRunBtn
* @see addOutputSwipe
*/
var addDescriptionExtras = function(app){
	var bookend = document.createElement("div");
	$(bookend).attr("id", "bookend");
	$("#apps").append(bookend);
	addOutputSwipe();
}

/**
* Displays the description of an application. The cache is first 
* checked to see if it contains the description (which it should) 
* and if not it is requested from the server.
* @param app the application whose description to display
* @see addDescriptionExtras
* @see cache	
*/
var showAppDescription = function(app){
	var cacheIndex = "app_" + app.path64;
	$("#apps").empty();
	if(cache.hasOwnProperty(cacheIndex)){
		addRunBtn(app);
		$("#apps").append(cache[cacheIndex]);
		addDescriptionExtras(app);
	}else{
		$.ajax("/app/" + app.path64,{ 
		"success" : function(data){
				addRunBtn(app);
				var cleaned = '<div class="outputDiv" id="outputDiv">';
				cleaned += cleanAppPage(data);
				cleaned += '</div>';
				$("#apps").append(cleaned);
				cache[cacheIndex] = cleaned;
				addDescriptionExtras(app);		
			}
		});
	}
	$("#mainMenuBtn").css("display", "block");
}

/**
* Adds swiping functionality to menus.
* Note that this is done completely differently then swiping through output. 
* This was a design decision based on two different types of data: menus are 
* designed to be paged through and thus consist of discrete blocks of data, 
* whereas application output is a contigious block of text. This adds handlers 
* for left and right swiping (prevPage and nextPage, respectively) as well as 
* allows an upward swipe to go to the root menu. Swiping events are triggered
* by the jquery.swipe plugin. 
* @see prevPage
* @see nextPage
* @see scrollLoc
* @see buildMenu
*/
var addMenuSwipe = function(){
	scrollLoc = $('html,body').scrollTop();
	$("#menu").swipe(function(dx, dy) {
		if(!allowPageSwipe){
			return;
		}
		if(Math.abs(dx) > 4){
			allowPageSwipe = false;
			if(dx > 0){
				prevPage();	
			}else{
				nextPage();	
			} 
			setTimeout(function(){
				allowPageSwipe=true;
				}, swipeInterval
			);
		}
		if(Math.abs(dy) > 3.5){
			if(dy < 0){
				buildMenu("");
			}
		}				
	}); 	
}

/**
* Vertically scrolls the viewport. The distance scrolled is a
* function of the distance moved during the scroll
* event. 
* @param dy distance moved during the scroll
* @see scrollLoc
* @see addOutputSwipe 
*/
var scroll = function(dy){
	var maxScroll = $("#bookend").offset().top;
	scrollLoc -= (dy / 5) * getViewportHeight();	
	if(scrollLoc > maxScroll) {
		scrollLoc = maxScroll;
	}else if(scrollLoc < 0){
		scrollLoc = 0;
	}
	$('html,body').animate({scrollTop: scrollLoc}, 200); 	
}

/**
* Adds swipe scrolling to application output. 
* As in addMenuSwipe, jquery.swipe provides the swipe events. This adds the
* event handlers to the output so that it will vertically scroll when swiped.
* Swipe intervals are limited to one every swipeInterval, to avoid duplicate
* events being fired for the same swipe.
* @see addMenuSwipe
* @see swipeInterval
* @see scroll
*/
var addOutputSwipe = function(){
	$("#outputDiv").swipe(function(dx, dy) {
		if(Math.abs(dy) > 4){
			var now = (new Date()).getTime();
			if( now - lastSwipeTime >  swipeInterval){
				scroll(dy);
				lastSwipeTime = now;
			}
		}				
	}); 	
}

/**
* App Sorting helper. Compares apps first by sortPriority, and then alphabetically.
* Apps with a lower sortPriority will appear before ones with higher or no sortPriority.
* Note that it allows for < 1 difference in the value of sortPriority, while maintaining 
* convention of -1/0/+1 return value for a comparison function.
* @param a first application
* @param b the second application
* @see apps
* @see window.onload
*/
var appCompare = function(a, b){
	var aHas = a.Application.hasOwnProperty("sortPriority");
	var bHas = b.Application.hasOwnProperty("sortPriority");
	if(aHas && !bHas){
		return -1;
	}
	if(bHas && !aHas){
		return 1;
	}
	if(aHas && bHas){
		var r = a.Application.sortPriority - b.Application.sortPriority;
		r /= Math.abs(r);
		if(r != 0){
			return r;
		}
	}
	var tA = a.Application.title.toLowerCase();
	var tB = b.Application.title.toLowerCase();
	if(tA == tB){
		return 0;
	}
	if(tA > tB){
		return 1;
	}
	return -1;
} 
/**
* Creates a div used to contain the arrows shown when a matrix menu has more than one page.
* Sets up the proper css and optionally an id.
* @param id The id to give the created div. If it is not set the div is not given an id.
*/
var createSideArrDiv = function(id){
	var el = document.createElement("div");
	$(el).addClass("sideArrow");
	if(typeof(id) != 'undefined' && id != ""){
		$(el).attr("id", id);
	}
	return el;
}
/**
* Adds an image with the specified source and optional id to the provided element.
* @param el The element to which the image will be appended
* @param src Location of image
* @param id Optional ID to give the image
*/
var addArrow = function(el, src, id){
	var i = document.createElement("img");
	$(i).attr("src", src);
	if(typeof(id) != 'undefined' && id != ""){
		$(i).attr("id", id);
	}
	$(el).append(i);
}
/**
* Creates left and right arrows on the sides of the menu.
* @see addArrow
* @see updateArrows
*/
var addArrows = function(){
	var rightArrow = createSideArrDiv("rightArrow");
	var leftArrow = createSideArrDiv("leftArrow");
	addArrow(rightArrow, "/images/right_arrow.png");
	addArrow(leftArrow, "/images/left_arrow.png");
	$(rightArrow).addClass("rightArrow");
	$(rightArrow).click(nextPage);
	$(leftArrow).click(prevPage);
	$(leftArrow).addClass("leftArrow");
	$("#apps").append(rightArrow);
	$("#apps").append(leftArrow);
	$(".sideArrow").css("top", ($(window).height() - $(".sideArrow").height()) / 2);
	updateArrows();				
}
/**
* Builds a menu with the specified contents. Caches apps belonging in the submenu, or will
* check all of apps if submenu has not been cached. Also adds swiping. 
* @param submenu Semicolon-separated list of categories to show
* @see addApp
* @see cache
* @see apps
* @see addArrows
* @see addMenuSwipe 
*/
var buildMenu = function(submenu){
	$("#apps").empty();
	nPages = 0;
	showingPage = 0;
	currentPage = false;
	var menuDiv = document.createElement("div");
	$(menuDiv).attr("id", "menu");
	$("#apps").append(menuDiv);
	if(cache.hasOwnProperty("menu_" + submenu)){
		for(var i in cache["menu_" + submenu]){
			addApp(cache["menu_" + submenu][i]);
		}
	}else{
		cache["menu_" + submenu] = [];
		for(var i in apps){
			var app = apps[i].Application;
			if(isInSubmenu(app, submenu)){
				addApp(app);
				cache["menu_" + submenu].push(app);
			}
		}
	}
	if(submenu == ""){
		$("#mainMenuBtn").css("display", "none");
	}else{
		$("#mainMenuBtn").css("display", "block");
	}
	addArrows();
	$('html,body').animate({scrollTop: 0}, 100);
	addMenuSwipe();
}
/**
* Checks screen size and appends smaller css rules if the screen is smaller than 400x400.
* @see smallScreen
*/
var setupCss = function(){
	if($(window).height() < 400 || $(window).width() < 400){
		var cssrule = "<style type='text/css'>";
		cssrule += ".app_icon{ width: 64px !important; height:62px !important}";
		cssrule += ".appContainer{ width: 25% !important; height: 30% !important}"
		cssrule += ".appTitle{font-size: 12px !important;}";
		cssrule += "</style>";
		$(cssrule).appendTo("head");
		smallScreen = true;
		return;	
	}

	smallScreen = false;				
}
/**
* Manually rebuild cache. This should not happen because it is automatically requested on 
* startup in a more efficient manner. This serves as a slower and manually trigggered backup
* should that fail.
* @see cache
* @see appsLoaded 
*/
var buildCache = function(){
	$("#txlogo").click(function(){return false;});
	appsLoaded = 0;
	$(apps).each(function(k, v){
		var app = v.Application;
		var cacheIndex = "app_" + app.path64;
		var n = apps.length;
		$.ajax("/app/" + app.path64,{ 
		"success" : function(data){
				var cleaned = '<div class="outputDiv">'+cleanAppPage(data) + '</div>';
				cache[cacheIndex] = cleaned;
				appsLoaded ++;
				$("#apps").empty();
				$("#apps").text(appsLoaded + " Applications cached of " + n);
				if(appsLoaded >= n){
					$("#apps").text("All applications loaded. Initializing menu.");
					setTimeout(function(){buildMenu(""); }, 3000);	
				}			
			}
		});
	});
}
/**
* Initializes the menu and fetches the app list from the server. It will detect an empty list
* (which should never be returned) and retry every half second until it succeeds. Upon 
* success it will build the menu and set up interaction handlers that depend on the app list.
* Called by window.onload
* @see buildMenu
* @see apps
* @see appCompare
*/
var initMenu = function(){
	$.getJSON("/applist/", function( data ){
			if(data.length >= 1){
                       		apps = data;
                        	apps.sort(appCompare);
                        	var menu = getUrlParam("menu");
				buildMenu(menu);
			        $("#mainMenuBtn").click(function(){
                			buildMenu("");
                			$("#mainMenuBtn").css("display", "none");
        			});
        			$("#txlogo").click(buildCache);
        			disableSelect("navHeader");
			}else{
				$("#apps").text("Recieved empty app list from server. Retrying in 1/2 second.");
				setTimeout(initMenu, 500);
			}
	});
}
/**
* Build App description page cache. It requests the master list from the server, and will 
* retry once if it recieves an empty response. Data is then put into the cache and stored
* until the user requests a description page. 
* @see cache
*/
var initDescriptionCache = function(retry){
	$.getJSON("/appdescriptions/", function(data){
		if(!$.isEmptyObject(data)){
			for(var i in data){
				cache[i] = '<div class="outputDiv" id="outputDiv">'+data[i]+"</div>";
			}	
		}else{
			if(retry) setTimeout("initDescriptionCache(false)", 500);
		}
	});				
}
/**
* Main setup. Requests app list and app description pages from the server
* and creates the root menu. Also checks css and calculates the proper 
* number of apps per page, sorts apps as per appCompare, and caches the 
* description pages to dramatically improve response time.
* @name window.onload
* @function	
* @see initMenu
* @see initDescriptionCache
* @see appsPerPage
* @see setupCss
* @see cache
*/
window.onload = function(){				
	setupCss();
	var w = 155;
	var h = 138;
	if(smallScreen){
		w = 115;
		h = 106;
	}
	var winWidth = $(window).width();
	var winHeight = getViewportHeight();
	appsPerPage = Math.floor(winWidth / w) * Math.floor(winHeight / h);

	initMenu();
	initDescriptionCache(true);
}
