<html>
<head>

<?php $random2 = rand(); echo "<link rel='stylesheet' type='text/css' href='css/global.css?test=$random2'>";?>


<?php
	//Load EVM's CSS if being ran locally on the EVM
	if($_SERVER['SERVER_ADDR']==$_SERVER['REMOTE_ADDR'] )
	{
		$random = rand();
		echo "<link rel='stylesheet' type='text/css' href='css/am37x-evm.css?rand=$random'>";
	
	}
?>



<?php


$cachefile = "cache".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING'];

if (file_exists($cachefile)) {


	// the page has been cached from an earlier request

	// output the contents of the cache file

	include($cachefile); 

	// exit the script, so that the rest isnt executed
	exit;

}
else
	ob_start();

?>

 

<link rel="stylesheet" type="text/css" href="css/fonts-min.css">
<script type="text/javascript" src="/javascript/combo1.js"></script>
<script src="/javascript/jquery-latest.js"></script>   








</head>


<body class="unselectable" style = "-webkit-user-select: none;-moz-user-select: none;">
<div id = "complete_container">
</div>

<script>

//YAHOO.util.Config.applyConfig("bootstrap",false);

YUI().use('io', 'node-event-simulate','node','node-base','node-event-delegate', 'transition', 'event-move', function (Y) {
//$('#complete_container').load("/index2.php");


    var uri = "/index2.php";

    // Define a function to handle the response data.
    function complete(id, o, args) {
        var id = id; // Transaction ID.
	//Y.one('#complete_container').set("innerHTML",o.responseText);
	
	$("#complete_container").html(o.responseText);
        //var data = o.responseText; // Response data.
        var args = args[1]; // 'ipsum'.

    };

    // Subscribe to event "io:complete", and pass an array
    // as an argument to the event handler "complete", since
    // "complete" is global.   At this point in the transaction
    // lifecycle, success or failure is not yet known.
    Y.on('io:complete', complete, Y, ['lorem', 'ipsum']);

    // Make an HTTP request to 'get.php'.
    // NOTE: This transaction does not use a configuration object.
    var request = Y.io(uri);



function handleClick (e) {
	
	e.preventDefault();
	e.stopPropagation();
	
	 var parent = e.target.get('parentNode');
	if(parent.get("tagName") == "TD")
		var request = Y.io("/"+ e.target.get('id'));
	 else
		var request = Y.io("/"+parent.get('id'));
	//$('#complete_container').load("/"+parent.get('id'));

}



Y.one('#complete_container').delegate('click', handleClick, 'a,img');

function handleClick2 (e) {
	e.preventDefault();
}
//Y.one('#complete_container').delegate('mousedown',handleClick2, 'img');


   
    var MIN_SWIPE = 20;

   

    Y.one("#complete_container").delegate("gesturemovestart", function(e) {
	
   var item = e.currentTarget;
        // Prevent Text Selection in IE
       item.once("selectstart", function(e) {
            e.preventDefault();
        });

         item.setData("swipeStart", e.pageX);

            item.once("gesturemoveend", function(e) {
		
                var swipeStart = item.getData("swipeStart"),
                    swipeEnd = e.pageX,
                    isSwipeLeft = (swipeStart - swipeEnd) > MIN_SWIPE;
			isSwipeRight = (swipeEnd - swipeStart ) > MIN_SWIPE;

                if (isSwipeLeft) {
			
			//alert($('.previous_arrow').attr('id'));
			//Y.one(".previous_arrow").simulate('click');
			Y.one(".previous_arrow").simulate('click');
                    
                }
		else if(isSwipeRight)
		{
			Y.one(".next_arrow").simulate('click');
		}
		

            });

    }, "div", {
        preventDefault:true
    });
});



</script>

	</body>
</html>


<?php

// open the cache file "cache/home.html" for writing
$fp = fopen($cachefile, 'w');
// save the contents of output buffer to the file
fwrite($fp, ob_get_contents());
// close the file
fclose($fp);
// Send the output to the browser
ob_end_flush();
?>
