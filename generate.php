<?php


function get_contents($category,$filestring)
{
	
	$pos = 	strpos($filestring,$category."=");
	

	if($pos != false)
	{
		$pos += strlen($category."=");
		$newlinepos = stripos($filestring,"\n",$pos);
		$returnedstring = substr($filestring,$pos,$newlinepos-$pos);
		return $returnedstring;
	} 
	return -1;

}


system("find  -name '*.desktop' -print > catdesktop.txt");
$handle = fopen("catdesktop.txt", "rb");
$contents = fread($handle,filesize("catdesktop.txt"));
fclose($handle);

$contents = explode("\n",$contents);

for($x = 0;$x<count($contents)&&strlen($contents[$x])>0;$x++)
{
	$handle = fopen($contents[$x], "rb");
	$dotdesktop = fread($handle,filesize($contents[$x]));
	fclose($handle);
	


		$type = get_contents("Type",$dotdesktop);
		if($type == -1)
		{
			echo "ERROR WITH".$contents[$x]." Dot Desktop:  $dotdesktop ";

		}
		elseif(strtolower($type) == "directory")
		{
			$top["Name"] = get_contents("Name",$dotdesktop);

			if(get_contents("X-MATRIX-DisplayPriority",$dotdesktop)!=-1)
				$top["Order"] = get_contents("X-MATRIX-DisplayPriority",$dotdesktop);
			else
				$top["Order"] = "999";

			$top["Icon"] = get_contents("Icon",$dotdesktop);
			$top["Icon"] = substr($top["Icon"],26);
			$top["Type"] = "directory";
			
		
			//name of category X-MATRIX-CategoryTarget
	
			$top["Category"] = get_contents("X-MATRIX-CategoryTarget",$dotdesktop);


			
			$application["top"]["apps"][] = $top;

		}elseif(strtolower($type) == "application")
		{

			$category = get_contents("Categories",$dotdesktop);


			$category =  trim(strtolower($category));
			$top["Name"] = get_contents("Name",$dotdesktop);
			if(get_contents("X-MATRIX-DisplayPriority",$dotdesktop)!=-1)
				$top["Order"] = get_contents("X-MATRIX-DisplayPriority",$dotdesktop);
			else
				$top["Order"] = 999;

			$top["Icon"] = get_contents("Icon",$dotdesktop);
			$top["Icon"] = substr($top["Icon"],26);

			$top["Type"] = "application";

			$top["Exec"] = get_contents("Exec",$dotdesktop);

			$top["ProgramType"] = get_contents("ProgramType",$dotdesktop);
			
			$description_link = get_contents("X-MATRIX-Description",$dotdesktop);

			//-1 will be set if there is no link to the description page/no description field
			$top["Description_Link"] = $description_link;

			
			$top["Lock"] = get_contents("X-MATRIX-LOCK",$dotdesktop);

			if($category == -1)
			{
				$application["top"]["apps"][] = $top;	
			}
			else
			{
				
				$application[$category]["apps"][] = $top;	

			}
					


		} 
	unset($top);
		
}

function cmp($a, $b)
{
	//print_r($a);
	//echo "A: ".$a[0]["Order"]." B: ". $b[0]["Order"]."<br>" ;
	if($a["Order"] < $b["Order"])
		return -1;
	elseif($a["Order"] == $b["Order"])
		return 0;
	elseif($a["Order"] > $b["Order"])
		return 1;



}

foreach ($application as $key => $value) {
    usort($application[$key]["apps"], "cmp");
}


$ourFileName = "json.txt";
$ourFileHandle = fopen($ourFileName, 'w') or die("can't open file");
fwrite($ourFileHandle,json_encode($application));
fclose($ourFileHandle);


?>

