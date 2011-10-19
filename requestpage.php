
<?php

$filename = "cache/".$_GET["link"];


$handle = fopen($filename, "rb");
$contents = fread($handle, filesize($filename));
fclose($handle);


echo $filename;


?>

