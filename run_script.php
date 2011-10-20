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

	





YUI().use('io','anim','node-base','node-event-delegate', 'transition', 'event-move', function (Y) 
{
	var  timer = null;
    function complete2(id, o, args) 
	{
		document.getElementById("container").innerHTML = o.responseText;
		if(o.responseText.match("Script complete") != null)
		{	
			timer.cancel();
		}
    }

	Y.on('io:complete', complete2, Y, ['lorem', 'ipsum']);

	function update()
	{
		<?php echo "var uri = \"filereader.php?filename=$random_string\";"; ?>
		//This is a fix for IE 8. IE 8 likes to cache Ajax results therefore you need to change the link
		//to something different each time so that IE 8 doesn't cache the results
		uri += "&rand="+(Math.random()*2356)+(Math.random()*4321)+(Math.random()*3961);
		Y.io(uri);
	}

	timer = Y.later(4000, null,update, [], true);
	
	update();

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




	</script>
	<?php }else{?>
		This program can't run since a program is already running that contains a lock that this program is trying to use
	<?php } ?>


