#!/bin/bash
JAVA_BIN=/usr/local/jdk1.6.0_27/bin/
rm -rf documentation/
mkdir documentation
cd $HOME/jsdoc_toolkit-2.4.0/jsdoc-toolkit/
#Client
$JAVA_BIN/java -jar jsrun.jar app/run.js -a -p -t="templates/outline" -D="title:Matrix Gui v2 Client Documentation" -D="index:files" $HOME/Documents/matrix-gui-v2/scripts/matrix.js 
mv $HOME/jsdoc_toolkit-2.4.0/jsdoc-toolkit/out/* $HOME/Documents/matrix-gui-v2/documentation/client
#Server
$JAVA_BIN/java -jar jsrun.jar app/run.js -a -p -t="templates/outline" -D="title:Matrix Gui v2 Server Documentation" -D="index:classes" $HOME/Documents/matrix-gui-v2/lib/*.js $HOME/Documents/matrix-gui-v2/server.js
mv $HOME/jsdoc_toolkit-2.4.0/jsdoc-toolkit/out/* $HOME/Documents/matrix-gui-v2/documentation/server

