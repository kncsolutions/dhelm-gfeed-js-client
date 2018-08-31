var WebSocket = require("ws");
var events = require('events');
var constants = require("./constants");
var url="";
var api_key="";
var Authenticated = false;
var UserDisconnection = false;
/**
 * @constructor
 * @name DhelmGfeed
 * @param {Object} params
 * @param {string} params.ws_url The web socket url.
 * @param {string} params.api_key The api key you have got on subscription.
 */
var DhelmGfeed = function(params) {
    if (params.ws_url==null) {
        throw "URL cannot be null";
    } 
    if(params.api_key==null){
        throw "API-KEY cannot be null";
    }
    url=params.ws_url;
    api_key=params.api_key;
    var ws = null;
    var subscribrd_exchanges=null;
    var instrument_types=null;
    var products=null;
    var TIMEOUT=1;
    var count=1;
    console.log(url);
    console.log(api_key);
    /**
	 * Initiate a websocket connection
	 * @memberOf DhelmGfeed
	 * @method connect
	 * @instance
	 */
    this.connect = function(callback) {
        if(ws && (ws.readyState == ws.CONNECTING || ws.readyState == ws.OPEN)) return;
        ws = new WebSocket(url);
        ws.onopen = function() {
            console.log('Client Connected!');
            Authenticate();
        };
        ws.onmessage=function(e){
            if(e!=null){
                if(e.data.includes('"Complete":true') 
                || e.data.includes('"AllowVMRunning":false') 
                    ||e.data.includes('"AllowServerOSRunning":false')){
                        console.log(e.data);
                        Authenticated=true;
                        if(Authenticated){
                            console.log("Authenticated");
                            if(callback)
                               callback(true);
                        }
                }
            }            
        };
        ws.onerror = function (error) {
              console.log('WebSocket Error ' + error);
         };
    };
    /**
     * Disconnects the web socket connection
	 * @memberOf DhelmGfeed
	 * @method disconnect
	 * @instance
	 */
	this.disconnect = function() {
		if(ws && ws.readyState != ws.CLOSING && ws.readyState != ws.CLOSED) {
            ws.close();
            UserDisconnection = true;
		}
    }
    /**
	 * Check if the web socket is connected
	 * @memberOf DhelmGfeed
	 * @method connected
	 * @instance
	 * @returns {bool}
	 */
	this.connected = function() {
		if(ws && ws.readyState == ws.OPEN) {
			return true;
		} else {
			return false;
		}
    };
    
    /**
	 * Get the list of subscribed exchanges
	 * @memberOf DhelmGfeed
	 * @method getExchanges
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getExchanges=function(callback){
        console.log("Trying to fetch subscribed exchanges..");
        var response=false;
        if(count>1)
        TIMEOUT=TIMEOUT+1000*count;
        count++;
        if(Authenticated) {
            subscribed_exchanges=null;
            setTimeout(function(){
                if(!response)
                  GetSubscribedExchanges();
                  ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_EXCHANGE_RESULT+'"') ){
                            console.log(e.data);
                            subscribrd_exchanges=e.data;
                            response=true;
                            count--;
                            if(TIMEOUT>1)
                            TIMEOUT=TIMEOUT-1000;
                            if(callback)
                               callback(subscribrd_exchanges);
                        }
                     }
                };
              },TIMEOUT);
           
        }
    };
    /**
	 *Get the list of instrument types for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getInstrumentTypes
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getInstrumentTypes=function(param,callback){
        console.log("Trying to fetch instrument types for the given exchange..");
        if (param.exchange==null) {
            throw "Invalid Parameter";
        }
        if(count>1)
        TIMEOUT=TIMEOUT+1000*count;
        count++;
        if(Authenticated) {
            instrument_types=null;
            setTimeout(function(){
            GetInstrumentTypes(param);
            ws.onmessage=function(e){
                if(e!=null){
                    if(e.data.includes('"MessageType":"'+constants.MESSAGE_INSTRUMENT_TYPES_RESULT+'"') ){
                        console.log(e.data);
                        instrument_types=e.data;
                        count--;
                        if(TIMEOUT>1)
                        TIMEOUT=TIMEOUT-1000;
                        if(callback)
                           callback(instrument_types);
                    }
                 }
            };
        },TIMEOUT);
        }
    };
    /**
	 *Get the list of products for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getInstrumentTypes
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {string} param.instrument_type The type of the instrument, e.g. NIFTY,GAIL etc(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getProducts=function(param,callback){
        console.log("Trying to fetch products for the given exchange..");
        if (param.exchange==null) {
            throw "Invalid Parameter";
        }
        incrTimegap();
        if(Authenticated) {
            products=null;
            setTimeout(function(){
            GetProducts(param);
            ws.onmessage=function(e){
                if(e!=null){
                    if(e.data.includes('"MessageType":"'+constants.MESSAGE_PRODUCTS_RESULT+'"') ){
                        console.log(e.data);
                        products=e.data;
                        decrTimegap();
                        if(callback)
                           callback(products);
                    }
                 }
            };
        },TIMEOUT);
        }
    };
    /**
	 * Get the list of expiry dates for different products for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getExpiryDates
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {string} param.instrument_type The type of the instrument, e.g. OPTIDX,FUTIDX etc(optional).
     * @param {string} param.product The product, e.g. NIFTY,BANKNIFTY etc(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getExpiryDates=function(param,callback){
        console.log("Trying to fetch the expiry dates for different products..");
        if (param.exchange==null) {
            throw "Invalid Parameter";
        }
        incrTimegap();
        if(Authenticated) {
            expiry_dates=null;
            setTimeout(function(){
            GetExpiryDates(param);
            ws.onmessage=function(e){
                if(e!=null){
                    if(e.data.includes('"MessageType":"'+constants.MESSAGE_EXPIRY_DATE_RESULT+'"') ){
                        console.log(e.data);
                        expiry_dates=e.data;
                        decrTimegap();
                        if(callback)
                           callback(expiry_dates);
                    }
                 }
            };
        },TIMEOUT);
        }
    };
    /**
     * 
     */
    this.onResponse=function(param){
       switch (param){
          case 1:
           if(subscribrd_exchanges!=null)
              return subscribrd_exchanges;
           else
            return constants.RESULT_NOT_PREPARED;
          break;
       }
    }
    //
    function Authenticate() {		
        if (ws.OPEN==1) {
            strMessage = '{"MessageType":"'+constants.AUTHENTICATE+'","Password":"' + api_key + '"}';
            if(!Authenticated)
			   callAPI(strMessage);
        }
    }
    //
    function GetSubscribedExchanges(){        
        if (ws.OPEN==1) {
            strMessage = '{"MessageType":"'+constants.GET_EXCHANGES+'"}';
            if(Authenticated){
               callAPI(strMessage);
             }
        }
    }
    //
    function GetInstrumentTypes(param){
        if (ws.OPEN==1) {
            strMessage = '{"MessageType":"'+constants.GET_INSTRUMENT_TYPES+
                          '","Exchange":"'+param.exchange+'"}';
            if(Authenticated){
               callAPI(strMessage);
             }
        }
    }
     //
     function GetProducts(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_PRODUCTS,
                          Exchange: param.exchange};
            if(param.instrument_type!=null)
            strMessage.InstrumentType= param.instrument_type;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetExpiryDates(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_EXPIRY_DATES,
                          Exchange: param.exchange};
            if(param.instrument_type!=null)
            strMessage.InstrumentType= param.instrument_type;
            if(param.product!=null)
            strMessage.Product= param.product;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    function callAPI(request){
		console.log("request: *****" + request + "*****");
		if (ws.OPEN) {
            ws.send(request);
        }
    }
    //
    function incrTimegap(){
        if(count>1)
            TIMEOUT=TIMEOUT+1000*count;
        count++;
    }
    //
    function decrTimegap(){
        count--;
        if(TIMEOUT>1)
           TIMEOUT=TIMEOUT-1000;
    }
};
module.exports = DhelmGfeed;