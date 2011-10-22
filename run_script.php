<?php

$i = 0;
$lock_string = "";
$currently_locked = false;
while (list($key, $value) = each($_GET)) {
	
	if($i==0)
	{
		$scriptname = $value;
	}
	else
	{	
		$lock_string .= $value." ";
		if(file_exists  ($value)==true)
		{
			echo "LOCK FILE EXIST";
			$currently_locked = true;
			break;
		}
		
	
	}
	$i++;
   
}


$random_string = strval(rand());
$random_string .= strval(rand());

$script_command = "./test.sh \"".$scriptname. "\" ".$random_string.".txt ".$lock_string;

$last_line = system($script_command." > /dev/null 2>/dev/null & ", $retval);
$enable_exit_link = true;

?>




	<?php include "menubar.php"; ?>
	<?php if($currently_locked==false){ ?>




		<div id="container"></div>
  

  

	


<script>

	<?php echo "var uri_link = \"filereader.php?filename=$random_string\";"; ?>
	$('.exit_link').hide();
	$('.back_link').hide();
	

	
	function update()
	{
		
		//This is a fix for IE 8. IE 8 likes to cache Ajax results therefore you need to change the link
		//to something different each time so that IE 8 doesn't cache the results
		var uri = uri_link+"&rand="+(Math.random()*2356)+(Math.random()*4321)+(Math.random()*3961);
		
		$.get(uri, function(data) 
		{
			$('#container').html(data);
			$('#container').scrollTop(document.getElementById("container").scrollHeight);
			
			
			if(data.match("Script complete") != null)
			{
				$('.exit_link').show();
				$('.back_link').show();
			}
			else
				setTimeout("update()",4000);

		});

		
	}

	setTimeout("update()",500);


	</script>
	<?php }else{?>
		This program can't run since a program is already running that contains a lock that this program is trying to use
	<?php } ?>


