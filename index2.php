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

$skipped = 0;
$page_number = 1;

$icon_per_col = 4;
$icon_per_row = 3;

$total = $icon_per_col * $icon_per_row;
$current_page = $_GET["page"];
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
				echo "<td class = 'icons_cell' align = 'center'   class = \"cf\">";
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

