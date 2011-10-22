	<table width = "100%" style = "margin-bottom:20px;">
		<tr>
			<td width = "10%" align = "center" >
				<?php 
					if(isset($enable_previous_link) == true && $enable_previous_link == true && isset($previous_page) == true)
					{
						$submenustring = "";
						if(isset($_GET["submenu"])==true)
						{
							$submenustring = "submenu=".$_GET["submenu"]."&";
							
						}
						$link = "index2.php?".$submenustring."page=".$previous_page;
						echo "<a href = '#' class = ' previous_arrow' id = '$link'><img id = 'previous_arrow_img' src= 'images/left-arrow-icon.png'></a>";
					}
				?>

			</td>
			<td width = "60%" align = "center" id = "banner" >
				<?php  
					echo "<img id = 'logo_img' src= 'images/tex.png'>";
				?>
				Matrix Application Launcher v2

			</td>
			<td  width = "10%" align = "center" >

				<?php
					//Only display the back icon if your currently not in the main menu
					if(isset($enable_exit_link) == true && $enable_exit_link == true)
					{
						echo "<a  class = 'back_link' href = '#' id = '' ><img id = 'back_button_img' src= 'images/back-arrow-icon.png'></a>";
					}
				?>

			</td>
			<td  width = "10%" align = "center" >

				<?php
					//Only display the back icon if your currently not in the main menu
					if(isset($enable_exit_link) == true && $enable_exit_link == true)
					{
						echo "<a  class = 'exit_link' href = '#' id = 'index2.php?page=0' ><img id = 'exit_button_img' src= 'images/multi-icon.png'></a>";
					}
				?>

			</td>
			<td  width = "10%" align = "center" >
				<?php

					if(isset($enable_next_link) == true && $enable_next_link == true && isset($next_page))
					{
						$submenustring = "";
						if(isset($_GET["submenu"])==true)
						{
							$submenustring = "submenu=".$_GET["submenu"]."&";
							
						}
						$link = "index2.php?".$submenustring."page=".$next_page;
						echo "<a href = '#' id = '$link' class = 'next_arrow' ><img id = 'next_arrow_img' src= 'images/right-arrow-icon.png'></a>";

					}
				?>
			</td>
		</tr>
	</table>
