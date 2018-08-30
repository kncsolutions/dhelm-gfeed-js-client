var packageInfo = require('../package.json');
function getPackageInfo() {
	return packageInfo;
}
const MAX_RETRIES=30;
const MAXDELAY=3000;
const AUTHENTICATE="Authenticate";
const GET_EXCHANGES="GetExchanges";
const GET_INSTRUMENT_TYPES= "GetInstrumentTypes";


const MESSAGE_EXCHANGE_RESULT="ExchangesResult";
const MESSAGE_INSTRUMENT_TYPES_RESULT="InstrumentTypesResult";

const RESULT_NOT_PREPARED='{"Message:ResponseNotAvailable"}';

module.exports = {
	getPackageInfo: getPackageInfo,
	MAX_RETRIES,
	MAXDELAY,
	AUTHENTICATE,
	GET_EXCHANGES,
	GET_INSTRUMENT_TYPES,
	MESSAGE_EXCHANGE_RESULT,
	MESSAGE_INSTRUMENT_TYPES_RESULT,
	RESULT_NOT_PREPARED
};