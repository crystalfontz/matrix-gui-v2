#!/bin/sh

mkdir -p tmp
mkdir -p lock

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
    touch "lock/"$item

   fi
 i=`expr $i + 1`

done

echo "Filename:"$filename
echo "Output:"$outputfilename
$filename > "tmp/"$outputfilename 2>&1

#Using a more unique string to detect if the script is completed
echo "_?!!MATRIX_SCRIPT_COMPLETED!!?_" >> "tmp/"$outputfilename



i=0

for item in "$@"
do

  if [ $i -gt 1 ]
  then
    rm -f "lock/"$item

   fi
 i=`expr $i + 1`

done

sleep 20
rm "tmp/"$outputfilename

