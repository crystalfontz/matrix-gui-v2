
<?php

$filename = $_GET["filename"].".txt";


$handle = fopen($filename, "rb");
$contents = fread($handle, filesize($filename));
fclose($handle);



$contents = str_replace("\n","<br>",$contents);
echo $contents;

if(strpos("Script Complete",$contents)==false)
{
	

}


?>

