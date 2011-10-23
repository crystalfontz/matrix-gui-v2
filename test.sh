#!/bin/sh


i=0

for item in "$@"
do

  if [ $i -eq 0 ]
  then
      
	filename=$item   
  fi
 
  if [ $i -eq 1 ] 
  then
        
	outputfilename=$item 
  fi

  if [ $i -gt 1 ]
  then
    touch $item

   fi
 i=`expr $i + 1`

done

echo "Filename:"$filename
echo "Output:"$outputfilename
$filename > $outputfilename 2>&1

echo "Script complete" >> $outputfilename



i=0

for item in "$@"
do

  if [ $i -gt 1 ]
  then
    rm -f $item

   fi
 i=`expr $i + 1`

done

sleep 20
rm $outputfilename

