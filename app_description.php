

<?php

$cachefile = "cache".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING'];
//Adding a random string to the end of the $_GET Query String to
//prevent IE from caching the Ajax request. The below line removes the random portion
//of the query so we can cache the page properly in php
if(stripos($cachefile, "&rand=")==true)
	$cachefile = substr($cachefile,0,stripos($cachefile, "&rand="));

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
	$program_type = $found_app["ProgramType"];

	if($found_app["Description_Link"]!=-1)
	{
		$handle = fopen($found_app["Description_Link"], "rb");
		$description = fread($handle,filesize($found_app["Description_Link"]));
		if(strlen($description)==0)
			$description = "Invalid link for description page";
		fclose($handle);

	}

	
	$app_title = $found_app["Name"];

	$link =  "run_script.php?&submenu=".urlencode($submenu)."&app=".urlencode($app_title);

	echo "<div id = 'descrip_text'";
		echo "<div id =\"no_display\"><h1 style = 'color:red;'>Sorry</h1>You can't run the GUI application $title. The system has detected that your embedded system is not connected to a display device.</div>";
		echo "<div id = \"running_remotely\"><h1 style = 'color:yellow;'>Warning</h1>You are currently running Matrix remotely and $title is a GUI based application. <br> After clicking run, look at the display device connected to the embedded system to see and/or interact with the application</div>";
	
		echo "<div id = \"run_application\" style= \"text-align:center;\">";
			echo "<a href = '$link'><img id = 'run_img' src= 'images/run-icon.png'></a>";	
		echo "</div>";


		echo "<div id = 'descrip_title' style= \"color:blue;\"><h1>$title</h1></div><br>";
		echo "<div>$description</div>";
	
	echo "</div>";
	

?> 


<script>

	<?php 
		if($program_type=="gui")
			echo "var isgraphicalApp = true;";
		else
			echo "var isgraphicalApp = false;";
	?>

	if(isgraphicalApp == true)
	{
		if(has_graphics == false)
		{
			$("#no_display").show();
			$("#running_remotely").hide();
			$("#run_application").hide();
		}
		else if(client_is_host == false)
		{
			$("#no_display").hide();
			$("#running_remotely").show();
			$("#run_application").show();
		}
	}
	else
	{
		$("#no_display").hide();
		$("#running_remotely").hide();
		$("#run_application").show();
	}

	


</script>
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
