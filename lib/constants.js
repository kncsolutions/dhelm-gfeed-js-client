var packageInfo = require('../package.json');
function getPackageInfo() {
	return packageInfo;
}
const MAX_RETRIES=30;
const MAXDELAY=3000;
const AUTHENTICATE="Authenticate";
const GET_EXCHANGES="GetExchanges";
const GET_INSTRUMENT_TYPES= "GetInstrumentTypes";
const GET_PRODUCTS="GetProducts";
const GET_EXPIRY_DATES="GetExpiryDates";


const MESSAGE_EXCHANGE_RESULT="ExchangesResult";
const MESSAGE_INSTRUMENT_TYPES_RESULT="InstrumentTypesResult";
const MESSAGE_PRODUCTS_RESULT="ProductsResult";
const MESSAGE_EXPIRY_DATE_RESULT="ProductsResult";

const RESULT_NOT_PREPARED='{"Message:ResponseNotAvailable"}';

module.exports = {
	getPackageInfo: getPackageInfo,
	MAX_RETRIES,
	MAXDELAY,
	AUTHENTICATE,
	GET_EXCHANGES,
	GET_INSTRUMENT_TYPES,
	GET_PRODUCTS,
	GET_EXPIRY_DATES,
	MESSAGE_EXCHANGE_RESULT,
	MESSAGE_INSTRUMENT_TYPES_RESULT,
	MESSAGE_PRODUCTS_RESULT,
	MESSAGE_EXPIRY_DATE_RESULT,
	RESULT_NOT_PREPARED
};