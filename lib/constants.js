var packageInfo = require('../package.json');
function getPackageInfo() {
	return packageInfo;
}
const AUTHENTICATE="Authenticate";
module.exports = {
	getPackageInfo: getPackageInfo,
    AUTHENTICATE
};