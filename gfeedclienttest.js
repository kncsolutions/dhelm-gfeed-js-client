var DhelmGfeed = require("./lib/index").DhelmGfeed;
var CONSTANTS = require("./lib/index").CONSTANTS;
//console.log(((new Date("2012-06-08")).getTime())/1000);
var wsclient = new DhelmGfeed({
	api_key: "f31b6d7d-0138-428d-93ef-28acbd9632d2",
	ws_url: "ws://nimblestream.lisuns.com:4526/"
});
//Example without call back
/*
wsclient.connect();
setTimeout(function(){
  wsclient.getExchanges();
  setTimeout(function(){
    //1 . to get exchanges
    console.log(wsclient.onResponse(1));
  },3000)

},5000);
*/

//Example with call back
wsclient.connect(onconnected);
function onconnected(isauthenticated){
  if(isauthenticated==true){
    wsclient.getExchanges(showexchanges);
    wsclient.getInstrumentTypes({
      exchange: "NFO",
      },show_instrument_types);
    wsclient.getProducts({
      exchange: "NFO",
    },show_products);
    setTimeout(function(){
      wsclient.getProducts({
        exchange: "NFO",
        instrument_type:"FUTIDX"
      },show_products);
    },1000);
    
    wsclient.getExpiryDates({
      exchange: "NFO",
      instrument_type:"FUTIDX",
      product: "BANKNIFTY"
    },show_expirydates);
    wsclient.getOptionTypes({
      exchange: "NFO",
      instrument_type:"FUTIDX",
      product: "BANKNIFTY",
      expiry:"25OCT2018"
    },show_option_types);
    wsclient.getStrikePrices({
      exchange: "NFO",
      instrument_type:"FUTIDX",
      product: "BANKNIFTY",
      expiry:"27SEP2018",
      optiontype:"FF"
    },show_strike_prices);
    wsclient.getLimitation(show_limitation);
    wsclient.getServerInfo(show_server_info);
    wsclient.getMarketMessage({
      exchange: "NFO"
    },show_market_message);
    wsclient.getExchangeMessage({
      exchange: "NFO"
    },show_exchange_message);
    wsclient.subscribeRealTime({
      exchange: "NSE",
      instrument_identifier:"SBIN"
    },show_realtime_result);
    wsclient.subscribeRealTimeSnapshot({
      exchange: "NSE",
      instrument_identifier:"SBIN",
      periodicity:CONSTANTS.MINUTE
    },show_realtime_snapshot_result);
    wsclient.getInstrumentsOnSearch({
      exchange: "NSE",
      search_word:"SBIN"
    },show_instruments_on_search);
    wsclient.getInstruments({
      exchange: "NSE"
    },show_instruments);
    wsclient.getLastQuote({
      exchange: "NSE",
      instrument_identifier:"SBIN"
    },show_last_quote);
    wsclient.getLastQuoteArray({
      exchange: "NSE",
      instrument_identifiers:["SBIN","INFY","BEPL"],
    },show_last_quote_array);
    wsclient.getSnapshot({
      exchange: "NSE",
      instrument_identifiers:["SBIN","INFY","BEPL"],
      periodicity: CONSTANTS.HOUR,
      period:1
    },show_snapshot_quote);
    wsclient.getHistoricalTick({
      exchange: "NSE",
      instrument_identifier:"SBIN",
      from:Math.round(((new Date("2018-08-08").getTime())/1000)),
      to: Math.round(Date.now()/1000)
    },show_historical_tick);
    wsclient.getHistoricalOHLC({
      exchange: "NSE",
      instrument_identifier:"SBIN",
      periodicity:CONSTANTS.DAY,
      from:Math.round(((new Date("2018-08-08").getTime())/1000)),
      to: Math.round(Date.now()/1000)
    },show_historical_ohlc);
   /* setTimeout(function(){
    wsclient.getStrikePrices({
      exchange: "NFO",
      instrument_type:"FUTIDX",
      product: "BANKNIFTY",
      expiry:"27SEP2018",
      optiontype:"FF"
    },show_strike_prices)},3000);*/
  
    setTimeout(function(){
      wsclient.getExchanges(showexchanges);
    },1000);
  }
  
}

//example callback function for getExchanges
function showexchanges(response){
   console.log("\n\n*****LIST OF EXCHANGES*****\n\n");
   console.log(response);
}
//
function show_instruments_on_search(response){
  console.log("\n\n*****LIST OF INSTRUMENTS ON SEARCH*****\n\n");
   console.log(response);
}
//
function show_instruments(response){
  console.log("\n\n*****LIST OF INSTRUMENTS ON SEARCH*****\n\n");
   console.log(response);
}
//
function show_last_quote(response){
  console.log("\n\n*****LAST QUOTE*****\n\n");
   console.log(response);
}
//
function show_last_quote_array(response){
  console.log("\n\n*****LAST QUOTE ARRAY*****\n\n");
   console.log(response);
}
//
function show_snapshot_quote(response){
  console.log("\n\n*****SNAPSHOT QUOTE ARRAY*****\n\n");
   console.log(response);
}
//
function show_historical_tick(response){
  console.log("\n\n*****HISTORICAL TICK*****\n\n");
   console.log(response);
}
//
function show_historical_ohlc(response){
  console.log("\n\n*****HISTORICAL OHLC*****\n\n");
   console.log(response);
}
//example callback function for getInstrumentTypes
function show_instrument_types(response){
  console.log("\n\n*****INSTRUMENT TYPES*****\n\n");
  console.log(response);
}
//example callback function for getProduct
function show_products(response){
  console.log("\n\n*****PRODUCTS*****\n\n");
  console.log(response);
}
//example callback function for getProduct
function show_expirydates(response){
  console.log("\n\n*****EXPIRY DATES*****\n\n");
  console.log(response);
}
//example callback function for getProduct
function show_option_types(response){
  console.log("\n\n*****OPTION TYPES*****\n\n");
  console.log(response);
}
//
function show_strike_prices(response){
  console.log("\n\n*****LIST OF STRIKE PRICES*****\n\n");
  console.log(response);
}
//
function show_limitation(response){
  console.log("\n\n*****LIMITATIONS*****\n\n");
  console.log(response);
}
//
function show_server_info(response){
  console.log("\n\n*****SERVER INFO*****\n\n");
  console.log(response);
}
//
function show_market_message(response){
  console.log("\n\n*****MARKET MESSAGE*****\n\n");
  console.log(response);
}
//
function show_exchange_message(response){
  console.log("\n\n*****EXCHANGE MESSAGE*****\n\n");
  console.log(response);
}
//
function show_realtime_result(response){
  console.log("\n\n*****REALTIME RESULT*****\n\n");
  console.log(response);
}
//
function show_realtime_snapshot_result(response){
  console.log("\n\n*****REALTIME SNAPSHOT RESULT*****\n\n");
  console.log(response);
}
//wsclient.disconnect();