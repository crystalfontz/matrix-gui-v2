<?php
/*
 * Copyright (C) 2011 Texas Instruments Incorporated - http://www.ti.com/ 
 * 
 * 
 *  Redistribution and use in source and binary forms, with or without 
 *  modification, are permitted provided that the following conditions 
 *  are met:
 *
 *    Redistributions of source code must retain the above copyright 
 *    notice, this list of conditions and the following disclaimer.
 *
 *    Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the 
 *    documentation and/or other materials provided with the   
 *    distribution.
 *
 *    Neither the name of Texas Instruments Incorporated nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 *  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
 *  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
 *  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
 *  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
 *  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/


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

$skipped = 0;
$page_number = 1;

//Load Matrix configuration file
$ini_array = parse_ini_file("matrix_config.ini");

$icon_per_col = $ini_array["icons_per_col"];
$icon_per_row = $ini_array["icons_per_row"];

$total = $icon_per_col * $icon_per_row;
$current_page = isset($_GET["page"]) == true ? $_GET["page"] : 0;
$i = $_GET["page"] * $total;
$previous_page = $current_page - 1;
$next_page = $current_page + 1;
$cell_height=100/$icon_per_row;
$cell_width=100/$icon_per_col;

if(isset($_GET["submenu"]))
	$submenu = $_GET["submenu"];
else
	$submenu = "top";

//Enable the next link if the there are more apps beyond this page
$enable_next_link = ($current_page+1)*$total <  count($var[$submenu]["apps"]);

//Only enable previous link if your not in page 0
$enable_previous_link = $i != 0;

//Only enable exit link if your currently not in the main menu
$enable_exit_link = $submenu != "top";



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

$menu_title = ($submenu == "top") ? "Matrix App Launcher v2 p".($current_page+1) : $submenu_entry["Name"]." Submenu p".($current_page+1);
?>

<style type="text/css">

.icons_cell
{

height:<?php echo $cell_height; ?>%;
width:<?php echo $cell_width; ?>%;
}


</style>
	<?php include "menubar.php"; ?>


	<table id = "iconlist" > <?php
		for($s = 0;$s<$icon_per_row;$s++)
		{
			echo "<tr>";
			for($w = 0;$w<$icon_per_col;$w++)
			{

	
				$img_src = $var[$submenu]["apps"][$i]["Icon"];
				$app_title = $var[$submenu]["apps"][$i]["Name"];
				echo "<td class = 'icons_cell' align = 'center' >";
				$class = "";
				if($i<count($var[$submenu]["apps"])) 
				{
					$disable_link = false;

					if(strtolower($var[$submenu]["apps"][$i]["Type"])=="directory")
					{
						$category = $var[$submenu]["apps"][$i]["Category"];
						$link = "index2.php?submenu=$category";

						if(count($var[$category]["apps"]) == 0)
						{
							$link = "coming_soon.php?submenu=$category";
						}
				
					}
					elseif(strtolower($var[$submenu]["apps"][$i]["Type"])=="application")
					{
	
						//This check to see if the application doesn't have a description page. If it doesn't then directly launch the application"
						if($var[$submenu]["apps"][$i]["Description_Link"]==-1)
						{	
							$link =  "run_script.php?&submenu=".urlencode($submenu)."&app=".urlencode($app_title);
							
							//Determine if the application is GUI based. If it is then add a class to the link so the javascript code can 
							//manipulate the link if it needs to
							if($var[$submenu]["apps"][$i]["ProgramType"]=="gui")
								$class = "class = 'is_gui_app'";
						}
						else	
							$link =  "app_description.php?submenu=".urlencode($submenu)."&app=".urlencode($app_title);
					}
						
						echo "<a href = '$link' $class><img src= '$img_src' ></a>";


					echo "<p>$app_title</p>";
					$i++;
				}

				echo "</td>";


			}
			echo "</tr>";


		}
		
	 echo "</table>";


?>

<script>

//Don't launch GUI based application directly if the application is being launched remotely
//Or if the target doesn't have an attached graphic device
if(client_is_host == false || has_graphics == false)
{
	$('.is_gui_app').each(function(index) {
		var link = $(this).attr("href");
		var new_link = link.substr(link.indexOf("&submenu="));
		new_link = "app_description.php?" + new_link;
		$(this).attr("href",new_link);
	});
}

</script>

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

