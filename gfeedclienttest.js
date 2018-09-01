var DhelmGfeed = require("./lib/index").DhelmGfeed;
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
   console.log("*****LIST OF EXCHANGES*****");
   console.log(response);
}
//example callback function for getInstrumentTypes
function show_instrument_types(response){
  console.log(response);
}
//example callback function for getProduct
function show_products(response){
  console.log(response);
}
//example callback function for getProduct
function show_expirydates(response){
  console.log(response);
}
//example callback function for getProduct
function show_option_types(response){
  console.log(response);
}
//
function show_strike_prices(response){
  console.log("*****LIST OF STRIKE PRICES*****");
  console.log(response);
}
//wsclient.disconnect();