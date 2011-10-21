

<?php

$cachefile = "cache".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING'];

/*
if (file_exists($cachefile)) {


	// the page has been cached from an earlier request

	// output the contents of the cache file

	include($cachefile); 

	// exit the script, so that the rest isnt executed
	exit;

}
else
	ob_start();*/ //Disable Caching on Description Page


$handle = fopen("json.txt", "rb");
$contents = fread($handle,filesize("json.txt"));
fclose($handle);


$var = json_decode($contents,true);

if(isset($_GET["submenu"]))
	$submenu = $_GET["submenu"];
else
	$submenu = "top";

$enable_exit_link = true;
?>




	<?php include "menubar.php"; ?>

<?php
	
	for($i = 0;$i<count($var[$submenu]["apps"]);$i++)
	{
		if($var[$submenu]["apps"][$i]["Name"]==$_GET["app"])
		{	
			
			$found_app = $var[$submenu]["apps"][$i];
			break;
			
			
		}
	
	}

	$title = $found_app["Name"];
	
	
	
	$descr = $found_app["Description_Link"];
	$description = "No Description";
	if($found_app["Description_Link"]!=-1)
	{
		$handle = fopen($found_app["Description_Link"], "rb");
		$description = fread($handle,filesize($found_app["Description_Link"]));
		if(strlen($description)==0)
			$description = "Invalid link for description page";
		fclose($handle);

	}

	
	$script_link = urlencode($found_app["Exec"]);

	$lock_list = $found_app["Lock"];

	$link =  "run_script.php?script=".$script_link;
	
	//lock file list isnt working

	$url = "";
	if($lock_list != -1)
	{
		
		$lock_list = explode(" ",$lock_list);
		for($loop = 0;$loop<count($lock_list);$loop++)
		{
			$url .= "&lock".$loop."=".htmlentities($lock_list[$loop]);
		}
		
		
	}

	
	echo "<div style= \"text-align:center;\">";
	echo "<a href = '#' id = '$link$url'><img id = 'run_img' src= 'images/run-icon.png'></a>";	
	echo "</div>";

	
	echo "<div id = 'descrip_title' style= \"color:blue;\">$title</div>";
	echo "<div  id = 'descrip_text'>$description</div>";
	

	

?> 


<?php
//Disable Caching on Description Page
/*
// open the cache file "cache/home.html" for writing
$fp = fopen($cachefile, 'w');
// save the contents of output buffer to the file
fwrite($fp, ob_get_contents());
// close the file
fclose($fp);
// Send the output to the browser
ob_end_flush();*/
?>
