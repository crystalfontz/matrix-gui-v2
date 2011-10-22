<html>
<head>

<?php $random2 = rand(); echo "<link rel='stylesheet' type='text/css' href='css/global.css?test=$random2'>";?>

<script>

<?php

if($_SERVER['SERVER_ADDR']==$_SERVER['REMOTE_ADDR'])
	echo "var client_is_host = true;";
else
	echo "var client_is_host = false;";
//Save output to temp so it doesn't output it to the HTML
$temp = system('fbset > /dev/null');
$has_graphics = system('echo $?');

if($has_graphics == 0)
	echo "var has_graphics = true;";
else
	echo "var has_graphics = false;";

?>

</script>

<?php
	//Load EVM's CSS if being ran locally on the EVM
	if($_SERVER['SERVER_ADDR']==$_SERVER['REMOTE_ADDR'] )
	{
		$random = rand();
		echo "<link rel='stylesheet' type='text/css' href='css/am37x-evm.css?rand=$random'>";
	
	}

	if(!file_exists("cache"))
	{
		mkdir("cache",6666);		
	}
?>




 

<link rel="stylesheet" type="text/css" href="css/fonts-min.css">
<script type="text/javascript" src="/javascript/combo1.js"></script>
<script src="/javascript/jquery-latest.js"></script>   








</head>


<body class="unselectable" style = "-webkit-user-select: none;-moz-user-select: none;">
<div id = "complete_container">
</div>

<script>



var link_history = ["index2.php?page=0"];
var uri = "/index2.php?page=0";

var previous_clicked = "index2.php?page=0";

$.get("/index2.php?page=0", function(data) 
{
			$('#complete_container').html(data);
			$(".back_link").attr("id",link_history[link_history.length-2]);
});


$("#complete_container").delegate("img", "mousedown", function(e)
{
       e.preventDefault();
});


$("#complete_container").delegate("a", "click", function(e)
{
		e.preventDefault();
		e.stopPropagation();
		var className = $(this).attr('class');
		var link =  $(this).attr('href');
		if(link==previous_clicked)
		{
			alert("This should never happen. Currently trying to go to the same page twice in a row");
			return;
		}
		
		if(className=="back_link")
		{
			link_history.pop();
		}
		else if(className=="exit_link")
		{
			link_history = ["index2.php?page=0"];
		}
		else
			link_history.push(link);

		$.get("/"+link, function(data) 
		{
			$('#complete_container').html(data);
			$(".back_link").attr("href",link_history[link_history.length-2]);
		});
		previous_clicked = link;
});

</script>

	</body>
</html>

