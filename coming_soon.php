

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



$enable_exit_link = 1;

	include "menubar.php"; 


	echo "<div id = 'coming_soon' style = 'text-align:center;'>";
	$menu_name = ucwords($_GET["submenu"]);
	echo "<h2>The applications in $menu_name will be coming soon</h2>";
	echo "<img src= 'images/coming-icon.png'>";	
	echo "</div>";

	?>


<?php
//Disable Caching on Description Page

// open the cache file "cache/home.html" for writing
$fp = fopen($cachefile, 'w');
// save the contents of output buffer to the file
fwrite($fp, ob_get_contents());
// close the file
fclose($fp);
// Send the output to the browser
ob_end_flush();
?>
