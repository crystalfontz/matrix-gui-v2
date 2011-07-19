DESCRIPTION = "Matrix GUI Application launcher"
HOMEPAGE = "https://gforge.ti.com/gf/project/matrix-gui-v2/"
LICENSE = "BSD"
SECTION = "multimedia"
PRIORITY = "optional"

PR = "10"

SRC_URI = "git://gitorious.org/matrix-gui-v2/matrix-gui-v2.git"

require matrix-gui-paths.inc

S = "${WORKDIR}"

do_install(){
	install -d ${D}/${bindir}/matrix-gui-v2 
	install -m 0777 ${S}/* ${D}/${bindir}/matrix-gui-v2/
	echo "exports.appsFolder = \"${MATRIX_APP_DIR}\";" >> ${D}/${bindir}/matrix-gui-v2/lib/configs.js	
}

RDEPENDS_${PN} += nodejs
