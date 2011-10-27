<?php

$i = 0;
$lock_string = "";
$currently_locked = false;


$handle = fopen("json.txt", "rb");
$contents = fread($handle,filesize("json.txt"));
fclose($handle);


$var = json_decode($contents,true);


if(isset($_GET["submenu"]))
	$submenu = $_GET["submenu"];
else
	$submenu = "top";


for($i = 0;$i<count($var[$submenu]["apps"]);$i++)
{
	if($var[$submenu]["apps"][$i]["Name"]==$_GET["app"])
	{	
		
		$found_app = $var[$submenu]["apps"][$i];
		break;
		
		
	}

}

$lock_list = $found_app["Lock"];

//Verify that there is a lock specified for this application
//Not sure why for this the value could be -1 int or -1 the string
if($lock_list != -1 && $lock_list != "-1")
{
	$lock_list_array = explode($lock_list," ");
	//Check if the lock list only has one lock. If so add to the array
	//Since index 0 will be empty

	if(count($lock_list_array) == 1)
		$lock_list_array[0] = $lock_list;

	for($x = 0;$x<count($lock_list_array);$x++)
	{
		if(file_exists  ("lock/".$lock_list_array[$x])==true)
		{
			$currently_locked = true;
			break;
		}

	}
}

if($currently_locked==false)
{
	$script_link = $found_app["Exec"];

	$random_string = strval(rand());
	$random_string .= strval(rand());

	$script_command = "./test.sh \"".$script_link. "\" ".$random_string.".txt ".$lock_list;

	$last_line = system($script_command." > /dev/null 2>/dev/null & ", $retval);
}

$enable_exit_link = true;

?>




	<?php include "menubar.php"; ?>
	<?php if($currently_locked==false){ ?>




		<div id="container"></div>
  

  

	


<script>

	<?php echo "var uri_link = \"$random_string\";"; ?>
	$('.exit_link').hide();
	$('.back_link').hide();
	
	var fail_count = 0;
	
	function update()
	{
		
		//This is a fix for IE 8. IE 8 likes to cache Ajax results therefore you need to change the link
		//to something different each time so that IE 8 doesn't cache the results
		var uri = "tmp/"+uri_link+".txt?rand="+Math.round((Math.random()*2356))+Math.round((Math.random()*4321))+Math.round((Math.random()*3961));
		
		$.get(uri, function(data) 
		{
			fail_count = 0;
			data = jQuery.trim(data);
			data = data.replace(/\n/g, '<br>');
			var script_complete = data.indexOf("_?!!MATRIX_SCRIPT_COMPLETED!!?_");
			if(script_complete != -1)
				data = data.replace("_?!!MATRIX_SCRIPT_COMPLETED!!?_", "Script Complete");

			<?php if($found_app["ProgramType"]!="gui"){ ?>
				$('#container').html(data);
				$('#container').scrollTop(document.getElementById("container").scrollHeight);		
			<?php } ?>

			if(script_complete != -1)
			{
				$('.exit_link').show();
				$('.back_link').show();
				<?php if($found_app["ProgramType"]=="gui"){ ?>
					$('.back_link').click();		
				<?php } ?>
			}
			else
				setTimeout("update()",3000);

		})
		.error(function() 
		{ 
			//Sometimes the output file isn't written fast enough to be able to be
			//read back in to check the status. This function will attempt to read the
			//file 3 times with an increase delay for each attempt. If it still hasn't 
			//Been able to read the file then it displays an error and allows the user to
			//get back out to the main menu
			fail_count++;
			if(fail_count==3)
			{
				$('#container').html("Failed to read output file");
				$('.exit_link').show();
				$('.back_link').show();
			}
			else
			{
				setTimeout("update()",fail_count*1500);
			}
		});

		
	}

	setTimeout("update()",500);


	</script>
	<?php }else{?>
		This program can't run since a program is already running that contains a lock that this program is trying to use
	<?php } ?>


