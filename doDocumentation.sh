#!/bin/bash
JAVA_BIN=/usr/local/jdk1.6.0_27/bin/
rm -rf documentation/
cd $HOME/jsdoc_toolkit-2.4.0/jsdoc-toolkit/
$JAVA_BIN/java -jar jsrun.jar app/run.js -a -t="templates/outline" -D="title:Matrix Gui v2 Client Documentation" -D="index:files" $HOME/Documents/matrix-gui-v2/scripts/matrix.js 
mv $HOME/jsdoc_toolkit-2.4.0/jsdoc-toolkit/out/* $HOME/Documents/matrix-gui-v2/documentation
