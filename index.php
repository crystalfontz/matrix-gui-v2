<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />

<script>

<?php


$client_is_host = $_SERVER['SERVER_NAME']==$_SERVER['REMOTE_ADDR']||$_SERVER['SERVER_NAME'] == "localhost";
if($client_is_host == true)
	echo "var client_is_host = true;";
else
	echo "var client_is_host = false;";


	if(!file_exists("cache"))
	{
		mkdir("cache",6666);		
	}
?>

if(client_is_host==false)
{
	var r=confirm("Does your target system have an attached display device?\nClick Ok and Remote Matrix will assume that a proper display device is attached to your target system.\nClick Cancel and Remote Matrix will assume that you do not have a display device attached to your target system.");
	if (r==true)
		var has_graphics = true;
	else
		var has_graphics = false;
}


</script>


<link rel="stylesheet" type="text/css" href="css/fonts-min.css">


<script type="text/javascript" src="/javascript/jquery-latest.js"></script>   

<link rel='stylesheet' type='text/css' href='css/global.css'>
<?php
	if($client_is_host == true)
	{
		//Load Matrix configuration file
		$ini_array = parse_ini_file("matrix_config.ini");

		$target_css = $ini_array["target_css"]."?".rand();
		echo "<link rel='stylesheet' type='text/css' href='css/$target_css'>";
	}
?>

</head>


<body class="unselectable" style = "-webkit-user-select: none;-moz-user-select: none;">
<div id = "complete_container">
</div>

<script>


var link_history = ["index2.php?page=0"];
var uri = "index2.php?page=0";

var previous_clicked = "index2.php?page=0";

$.get("index2.php?page=0", function(data) 
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
		
		//Sometimes if a request is taking a long time you might try clicking a link more then once thinking that
		//your click request was not accepted. This causes multiple request for the same page to be sent which in turn
		//sometimes results in every link you click causing 2+ request to go through. This code checks to make sure
		//your requesting a new pageand not the same page twice
		if(link==previous_clicked)
			return false;
		
		previous_clicked = link;
		
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

		//Adds a random string to the end of the $_GET Query String for page accessed.
		//This prevents IE from caching the Ajax request.
		link = link + "&rand="+Math.round((Math.random()*2356))+Math.round((Math.random()*4321))+Math.round((Math.random()*3961));
		$.get(link, function(data) 
		{
			$('#complete_container').html(data);
			$(".back_link").attr("href",link_history[link_history.length-2]);
		});
		
});

</script>

	</body>
</html>

