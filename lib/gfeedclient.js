var WebSocket = require("ws");
var events = require('events');
var constants = require("./constants");
var url="";
var api_key="";
var Authenticated = false;
var UserDisconnection = false;
var TIMEOUT=1000;
var  FORCED_EXIT_TIMEOUT=100;
var LOCK_GET_EXCHANGES=false;
var LOCK_GET_INSTRUMENTS_TYPES=false;
var LOCK_GET_PRODUCTS=false;
var LOCK_GET_EXPIRY=false;
var LOCK_GET_OPTION_TYPES=false;
var LOCK_GET_STRIKE_PRICES=false;
var AUTO_MODE=true;
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
    var subscribrd_exchanges=constants.RESULT_NOT_PREPARED;
    var instrument_types=constants.RESULT_NOT_PREPARED;
    var products=constants.RESULT_NOT_PREPARED;
    var expiry_dates=constants.RESULT_NOT_PREPARED;
    var option_types=constants.RESULT_NOT_PREPARED;
    var strike_prices=constants.RESULT_NOT_PREPARED;
    var SYNCHRONIZATION_EXP=Date.now()+TIMEOUT;
    var count=0;
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
        if(!LOCK_GET_EXCHANGES){
            console.log("Trying to fetch subscribed exchanges..");
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_EXCHANGES=true;
            r(1,forceed_exit_time);
            if(Authenticated) {
                subscribed_exchanges=null;
                setTimeout(function(){
                GetSubscribedExchanges();
                ws.onmessage=function(e){
                if(e!=null){
                     if(e.data.includes('"MessageType":"'+constants.MESSAGE_EXCHANGE_RESULT+'"') ){
                            console.log(e.data);
                            subscribrd_exchanges=e.data;
                            count--;
                            LOCK_GET_EXCHANGES=false;
                            if(callback)
                               callback(subscribrd_exchanges);
                      }
                     }
                };
              },(count>0)?getSynchronizationDelay():1);
        }
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
      if(!LOCK_GET_INSTRUMENTS_TYPES){
        console.log("Trying to fetch instrument types for the given exchange..");
        if (param.exchange==null) {
            throw "Invalid Parameter";
        }
        var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
        count++;
        LOCK_GET_INSTRUMENTS_TYPES=true;
        r(8,forceed_exit_time);
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
                        LOCK_GET_INSTRUMENTS_TYPES=false;
                        if(callback)
                           callback(instrument_types);
                    }
                 }
            };
        },(count>0)?getSynchronizationDelay():1);
        }
      }
    };
    /**
	 *Get the list of products for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getProducts
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {string} param.instrument_type The type of the instrument, e.g. NIFTY,GAIL etc(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getProducts=function(param,callback){
    if(!LOCK_GET_PRODUCTS){
        console.log("Trying to fetch products for the given exchange..");
        if (param.exchange==null) {
            throw "Invalid Parameter";
        }
        var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
        count++;
        LOCK_GET_PRODUCTS=true;
        r(9,forceed_exit_time);
        if(Authenticated) {
            products=null;
            setTimeout(function(){
            GetProducts(param);
            ws.onmessage=function(e){
                if(e!=null){
                    if(e.data.includes('"MessageType":"'+constants.MESSAGE_PRODUCTS_RESULT+'"') ){
                        console.log(e.data);
                        products=e.data;
                        count--;
                        LOCK_GET_PRODUCTS=false;
                        if(callback)
                           callback(products);
                    }
                 }
            };
        },(count>0)?getSynchronizationDelay():1);
        }
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
    if(!LOCK_GET_EXPIRY){
        console.log("Trying to fetch the expiry dates for different products..");
        if (param.exchange==null) {
            throw "Invalid Parameter";
        }
        var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
        count++;
        LOCK_GET_EXPIRY=true;
        r(10,forceed_exit_time);
        if(Authenticated) {
            expiry_dates=null;
            setTimeout(function(){
            GetExpiryDates(param);
            ws.onmessage=function(e){
                if(e!=null){
                    if(e.data.includes('"MessageType":"'+constants.MESSAGE_EXPIRY_DATE_RESULT+'"') ){
                        console.log(e.data);
                        expiry_dates=e.data;
                        count--;
                        LOCK_GET_EXPIRY=false;
                        if(callback)
                           callback(expiry_dates);
                    }
                 }
            };
        },(count>0)?getSynchronizationDelay():1);
        }
    }
    };
     /**
	 * Get the list of option types  for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getOptionTypes
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {string} param.instrument_type The type of the instrument, e.g. OPTIDX,FUTIDX etc(optional).
     * @param {string} param.product The product, e.g. NIFTY,BANKNIFTY etc(optional).
     * @param {string} param.expiry The expiry date, e.g. 25OCT2018(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getOptionTypes=function(param,callback){
        if(!LOCK_GET_OPTION_TYPES){
            console.log("Trying to fetch the option types.");
            if (param.exchange==null) {
                throw "Invalid Parameter";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_OPTION_TYPES=true;
            r(11,forceed_exit_time);
            if(Authenticated) {
                expiry_dates=null;
                setTimeout(function(){
                GetOptionTypes(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_OPTION_TYPES_RESULT+'"') ){
                            console.log(e.data);
                            option_types=e.data;
                            count--;
                            LOCK_GET_OPTION_TYPES=false;
                            if(callback)
                               callback(option_types);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay():1);
            }
        }
        };
        /**
	 * Get the list of strike prices   for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getStrikePrices
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {string} param.instrument_type The type of the instrument, e.g. OPTIDX,FUTIDX etc(optional).
     * @param {string} param.product The product, e.g. NIFTY,BANKNIFTY etc(optional).
     * @param {string} param.expiry The expiry date, e.g. 25OCT2018(optional).
     * @param {string} param.optiontype The option type, e.g. PE,CE(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getStrikePrices=function(param,callback){
        if(!LOCK_GET_STRIKE_PRICES){
            console.log("Trying to fetch the strike prices.");
            if (param.exchange==null) {
                throw "Invalid Parameter";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_STRIKE_PRICES=true;
            r(12,forceed_exit_time);
            if(Authenticated) {
                strike_prices=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetStrikePrices(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_STRIKE_PRICES_RESULT+'"') ){
                            console.log(e.data);
                            option_types=e.data;
                            count--;
                            LOCK_GET_STRIKE_PRICES=false;
                            if(callback)
                               callback(option_types);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay():1);
            }
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
    //
    function GetOptionTypes(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_OPTION_TYPES,
                          Exchange: param.exchange};
            if(param.instrument_type!=null)
            strMessage.InstrumentType= param.instrument_type;
            if(param.product!=null)
            strMessage.Product= param.product;
            if(param.expiry!=null)
            strMessage.Expiry= param.expiry;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetStrikePrices(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_STRIKE_PRICES,
                          Exchange: param.exchange};
            if(param.instrument_type!=null)
            strMessage.InstrumentType= param.instrument_type;
            if(param.product!=null)
            strMessage.Product= param.product;
            if(param.expiry!=null)
            strMessage.Expiry= param.expiry;
            if(param.optiontype!=null)
            strMessage.OptionType= param.optiontype;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function callAPI(request){
		console.log("request: *****" + request + "*****");
		if (ws.OPEN) {
            ws.send(request);
        }
    }
    //
    function  getSynchronizationDelay(instance_no){
      if(Date.now()<SYNCHRONIZATION_EXP){
          return ((SYNCHRONIZATION_EXP=SYNCHRONIZATION_EXP+TIMEOUT)-Date.now());
      }
      else{
          return ((SYNCHRONIZATION_EXP=Date.now()+TIMEOUT)-Date.now());
      }
    }
    //Function to release an requested resource on predefined time expiration
    function r(fnIndex,forceed_exit_time){
       // console.log("*****************CLOCK STARTED*************************");
        setTimeout(function(){
           if(fnIndex==1 && LOCK_GET_EXCHANGES)LOCK_GET_EXCHANGES=false;
           else if(fnIndex==8 &&LOCK_GET_INSTRUMENTS_TYPES)LOCK_GET_INSTRUMENTS_TYPES=false;
           else if(fnIndex==9 && LOCK_GET_PRODUCTS)LOCK_GET_PRODUCTS=false;
           else if(fnIndex==10 && LOCK_GET_EXPIRY)LOCK_GET_EXPIRY=false;
           else if(fnIndex==11 && LOCK_GET_OPTION_TYPES)LOCK_GET_OPTION_TYPES=false;
           else if(fnIndex==12 && LOCK_GET_STRIKE_PRICES)LOCK_GET_STRIKE_PRICES=false;
        },forceed_exit_time-Date.now());
   }
};
module.exports = DhelmGfeed;