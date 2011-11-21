

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


$handle = fopen("json.txt", "rb");
$contents = fread($handle,filesize("json.txt"));
fclose($handle);

$var = json_decode($contents,true);


$enable_exit_link = 1;
$submenu = $_GET["submenu"];
foreach ($var as $k => $v) 
{
 
	for($j = 0;$j<count($v["apps"]);$j++)
	{	
		
		$current_entry = $v["apps"][$j];

		if($current_entry["Type"]=="directory" && $current_entry["Category"] == $submenu)
		{	
			
			$found_entry = true;
			$submenu_entry = $current_entry;
			break;
		}

	}

	if($found_entry == true)
		break;
}

$menu_title = "Coming Soon";


	include "menubar.php"; 


	echo "<div id = 'coming_soon' style = 'text-align:center;'>";
	$menu_name = $submenu_entry["Name"];
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
