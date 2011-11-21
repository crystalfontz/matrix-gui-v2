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
?>
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
