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

	var t=setTimeout("update()",1000);

	function update()
	{
				<?php
			
				$Url = "filereader.php?filename=$random_string";
					echo "$('#container').load('$Url');";
				?>
				
	
				if($('#container').html().match("Script complete") != null)
					{	
						clearTimeout(t);
					}
					else
						t=setTimeout("update()",2000);
	}



<?php
//Load EVM's CSS if being ran locally on the EVM
if($_SERVER['SERVER_ADDR']==$_SERVER['REMOTE_ADDR'] )
{?>


 YUI().use('anim','node-base','node-event-delegate', 'transition', 'event-move', function (Y) 
	{
	var MIN_SWIPE = 10;

	   var anim = new Y.Anim({
		    node: '#container',
	 	duration: .3,
	   	easing: Y.Easing.elasticNone
	

		});

		Y.one("#container").delegate("gesturemovestart", function(e) 
		{
	
		    var item = e.currentTarget;
		    // Prevent Text Selection in IE
		    item.once("selectstart", function(e) {
		        e.preventDefault();
		    });
		
			item.setData("swipeStart", e.pageY);

			item.once("gesturemoveend", function(e) {
	
			var swipeStart = item.getData("swipeStart"),
				swipeEnd = e.pageY,
				isSwipeDown = (swipeEnd - swipeStart ) > MIN_SWIPE;
				isSwipeUp = (swipeStart - swipeEnd  ) > MIN_SWIPE;

			if (isSwipeDown) {
			   var start = Y.one('#container').get('scrollTop');
				e.preventDefault(); 
				anim.set('to', { scroll: [start, start + (swipeEnd - swipeStart)] });
				anim.run();
			}

			if(isSwipeUp)
			{
				var start = Y.one('#container').get('scrollTop');
				e.preventDefault(); 
				anim.set('to', { scroll: [start, start - (swipeStart - swipeEnd)] });
				anim.run();
			}
		

			});
		   

		}, "div", {
		    preventDefault:true
		});
	});


<?php } ?>


	</script>
	<?php }else{?>
		This program can't run since a program is already running that contains a lock that this program is trying to use
	<?php } ?>


