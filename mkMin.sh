#!/bin/bash
JAVA_BIN=/usr/local/jdk1.6.0_27/bin/java
GOOGLE_CLOSURE_COMPILER=/home/thomas/cc/compiler.jar
JQUERY_PATH=/home/thomas/Documents/matrix-gui-v2/scripts/jquery-1.6.2.js
JQUERY_SWIPE_PATH=/home/thomas/Documents/matrix-gui-v2/scripts/jquery.swipe.js
MATRIX_JS_PATH=/home/thomas/Documents/matrix-gui-v2/scripts/matrix.js
OUTPUT_PATH=/home/thomas/Documents/matrix-gui-v2/scripts/matrix_min_combined.js
${JAVA_BIN} -jar ${GOOGLE_CLOSURE_COMPILER}  --js=${JQUERY_PATH} --js=${JQUERY_SWIPE_PATH} --js=${MATRIX_JS_PATH} --js_output_file=${OUTPUT_PATH}

