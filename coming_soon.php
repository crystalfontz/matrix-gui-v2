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
