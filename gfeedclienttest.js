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
//wsclient.disconnect();