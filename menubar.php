	<table width = "100%" style = "margin-bottom:10px;">
		<tr>
			<td  align = "left" >
				<?php 
					$submenustring = "";
					if(isset($_GET["submenu"])==true)
					{
						$submenustring = "submenu=".$_GET["submenu"]."&";
							
					}
					$link = "index2.php?".$submenustring."page=".$previous_page;

					if(isset($enable_previous_link) == true && $enable_previous_link == true && isset($previous_page) == true)
					{
						
						echo "<a href = '$link' class = 'previous_arrow' ><img id = 'previous_arrow_img' src= 'images/left-arrow-icon.png'></a>";
					}
					else
						echo "<a href = '$link' class = 'previous_arrow hide_link' ><img id = 'previous_arrow_img' src= 'images/left-arrow-icon.png'></a>";

					
					//Added these two html elements so that each side will be even
					echo "<a  class = 'hide_link' href = '#'  ><img id = 'exit_button_img' src= 'images/multi-icon.png'></a>";
					echo "<a href = '#'  class = 'hide_link' ><img id = 'next_arrow_img' src= 'images/right-arrow-icon.png'></a>";


				?>

			</td>
			<td  align = "center" id = "banner" >
				<?php  
					echo "<img id = 'logo_img' src= 'images/tex.png'>";
					echo $menu_title;
				?>
				

			</td>
			<td  align = "right" >

				<?php
					//Only display the back icon if your currently not in the main menu
					if(isset($enable_exit_link) == true && $enable_exit_link == true)
					{
						echo "<a  class = 'back_link' href = '#'  ><img id = 'back_button_img' src= 'images/back-arrow-icon.png'></a>";
					}
					else
						echo "<a  class = 'back_link hide_link' href = '#'  ><img id = 'back_button_img' src= 'images/back-arrow-icon.png'></a>";

				?>


				<?php
					//Only display the back icon if your currently not in the main menu
					if(isset($enable_exit_link) == true && $enable_exit_link == true)
					{
						echo "<a  class = 'exit_link' href = 'index2.php?page=0'  ><img id = 'exit_button_img' src= 'images/multi-icon.png'></a>";
					}
					else
						echo "<a  class = 'exit_link hide_link' href = 'index2.php?page=0'  ><img id = 'exit_button_img' src= 'images/multi-icon.png'></a>";

				?>

	
				<?php
					$submenustring = "";
					if(isset($_GET["submenu"])==true)
					{
						$submenustring = "submenu=".$_GET["submenu"]."&";
						
					}
					$link = "index2.php?".$submenustring."page=".$next_page;

					if(isset($enable_next_link) == true && $enable_next_link == true && isset($next_page))
					{
						echo "<a href = '$link'  class = 'next_arrow' ><img id = 'next_arrow_img' src= 'images/right-arrow-icon.png'></a>";
					}
					else
						echo "<a href = '$link'  class = 'next_arrow hide_link' ><img id = 'next_arrow_img' src= 'images/right-arrow-icon.png'></a>";

				?>
			</td>
		</tr>
	</table>
