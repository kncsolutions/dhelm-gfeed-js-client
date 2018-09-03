var WebSocket = require("ws");
var constants = require("./constants");
var url="";
var api_key="";
var Authenticated = false;
var UserDisconnection = false;
var previous_call=-1;
var MULTIPLIER=30;
var TIMEOUT=1000;
var FORCED_EXIT_TIMEOUT=100;
var LOCK_GET_EXCHANGES=false;
var LOCK_GET_INSTRUMENTS_ON_SEARCH=false;
var LOCK_GET_INSTRUMENTS=false;
var LOCK_GET_LAST_QUOTE=false;
var LOCK_GET_LAST_QUOTE_ARRAY=false;
var LOCK_GET_SNAPSHOT=false;
var LOCK_GET_HISTORY_TICK=false;
var LOCK_GET_INSTRUMENTS_TYPES=false;
var LOCK_GET_PRODUCTS=false;
var LOCK_GET_EXPIRY=false;
var LOCK_GET_OPTION_TYPES=false;
var LOCK_GET_STRIKE_PRICES=false;
var LOCK_GET_LIMITATION=false;
var LOCK_GET_SERVER_INFO=false;
var LOCK_GET_MARKET_MESSAGE=false;
var LOCK_GET_EXCHANGE_MESSAGE=false;
var LOCK_SUBSCRIBE_REALTIME=false;
var LOCK_SUBSCRIBE_REALTIME_SNAPSHOT=false;
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
    var instrument_list_on_search=constants.RESULT_NOT_PREPARED;
    var instrument_list=constants.RESULT_NOT_PREPARED;
    var last_quote=constants.RESULT_NOT_PREPARED;
    var last_quote_array=constants.RESULT_NOT_PREPARED;
    var snapshot=constants.RESULT_NOT_PREPARED;
    var hisotical_tick=constants.RESULT_NOT_PREPARED;
    var hisotical_ohlc=constants.RESULT_NOT_PREPARED;
    var instrument_types=constants.RESULT_NOT_PREPARED;
    var products=constants.RESULT_NOT_PREPARED;
    var expiry_dates=constants.RESULT_NOT_PREPARED;
    var option_types=constants.RESULT_NOT_PREPARED;
    var strike_prices=constants.RESULT_NOT_PREPARED;
    var limitation=constants.RESULT_NOT_PREPARED;
    var server_info=constants.RESULT_NOT_PREPARED;
    var market_message=constants.RESULT_NOT_PREPARED;
    var exchange_message=constants.RESULT_NOT_PREPARED;
    var real_time_result=constants.RESULT_NOT_PREPARED;
    var real_time_snapshot_result=constants.RESULT_NOT_PREPARED;
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
                subscribed_exchanges=constants.RESULT_NOT_PREPARED;
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
              },(count>0)?getSynchronizationDelay(1):1);
        }
        }
    };
    /**
	 * Returns array of max. 20 instruments (properties) by selected exchange and ‘search word’
	 * @memberOf DhelmGfeed
	 * @method getInstrumentsOnSearch
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {string} param.search_word The search word(required).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getInstrumentsOnSearch=function(param,callback){
        if(!LOCK_GET_INSTRUMENTS_ON_SEARCH){
            console.log("Trying to fetch instruments on search..");
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_INSTRUMENTS_ON_SEARCH=true;
            r(2,forceed_exit_time);
            if(Authenticated) {
                instrument_list_on_search=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetInstrumentsOnSearch(param);
                ws.onmessage=function(e){
                if(e!=null){
                     if(e.data.includes('"MessageType":"'+constants.MESSAGE_INSTRUMENTS_ON_SEARCH_RESULT+'"') ){
                            console.log(e.data);
                            instrument_list_on_search=e.data;
                            count--;
                            LOCK_GET_INSTRUMENTS_ON_SEARCH=false;
                            if(callback)
                               callback(instrument_list_on_search);
                      }
                     }
                };
              },(count>0)?getSynchronizationDelay(2):1);
        }
        }
    };
    /**
	 * Returns array of instruments (properties) by selected exchange.
	 * @memberOf DhelmGfeed
	 * @method getInstruments
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {string} param.instrument_type Name of Supported InstrumentType.E.g. FUTIDX(optional).
     * @param {string} param.product Name of Supported Product..E.g. BANKNIFTY(optional).
     * @param {string} param.expiry Value of Supported Expiry..E.g. 30AUG2018(optional).
     * @param {string} param.optiontype Name of the option type..E.g. CE(optional).
     * @param {string} param.strikeprice String representation of the strike price.(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getInstruments=function(param,callback){
        if(!LOCK_GET_INSTRUMENTS){
            console.log("Trying to fetch instruments..");
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_INSTRUMENTS=true;
            r(3,forceed_exit_time);
            if(Authenticated) {
                instrument_list=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetInstruments(param);
                ws.onmessage=function(e){
                if(e!=null){
                     if(e.data.includes('"MessageType":"'+constants.MESSAGE_INSTRUMENTS_RESULT+'"') ){
                            console.log(e.data);
                            instrument_list=e.data;
                            count--;
                            LOCK_GET_INSTRUMENTS=false;
                            if(callback)
                               callback(instrument_list);
                      }
                     }
                };
              },(count>0)?getSynchronizationDelay(3):1);
        }
        }
    };
    /**
	 * Returns detailed information about Last Trade Price (LTP)
	 * @memberOf DhelmGfeed
	 * @method getLastQuote
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {string} param.instrument_identifier The instrument identifier(required).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getLastQuote=function(param,callback){
        if(!LOCK_GET_LAST_QUOTE){
            console.log("Trying to fetch last quote.");
            if (param.exchange==null) {
                throw "Invalid Parameter/exchange cannot be null.";
            }
            if (param.instrument_identifier==null) {
                throw "Invalid Parameter/instrument_identifier cannot be null.";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_LAST_QUOTE=true;
            r(4,forceed_exit_time);
            if(Authenticated) {
                last_quote=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetLastQuote(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_LAST_QUOTE_RESULT+'"') ){
                            console.log(e.data);
                            last_quote=e.data;
                            count--;
                            LOCK_GET_LAST_QUOTE=false;
                            if(callback)
                               callback(last_quote);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(4):1);
            }
        }
    };
    /**
	 * Returns detailed information about Last Trade Price (LTP) of Multiple Symbols (max 25 in single call)
	 * @memberOf DhelmGfeed
	 * @method getLastQuoteArray
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {Array} param.instrument_identifiers The instrument identifiers(required).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getLastQuoteArray=function(param,callback){
        if(!LOCK_GET_LAST_QUOTE_ARRAY){
            console.log("Trying to fetch last quote array.");
            if (param.exchange==null) {
                throw "Invalid Parameter/exchange cannot be null.";
            }
            if (param.instrument_identifiers==null) {
                throw "Invalid Parameter/instrument_identifiers cannot be null.";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_LAST_QUOTE_ARRAY=true;
            r(5,forceed_exit_time);
            if(Authenticated) {
                last_quote_array=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetLastQuoteArray(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_LAST_QUOTE_ARRAY_RESULT+'"') ){
                            console.log(e.data);
                            last_quote_array=e.data;
                            count--;
                            LOCK_GET_LAST_QUOTE_ARRAY=false;
                            if(callback)
                               callback(last_quote_array);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(5):1);
            }
        }
    };
    /**
	 * Returns last snapshot of Multiple Symbols (max 25 instruments in single call)
	 * @memberOf DhelmGfeed
	 * @method getSnapshot
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {Array} param.instrument_identifiers The instrument identifiers(required).
     * @param {string} param.periodicity The periodicity/"HOUR" or "MINUTE"(optional).
     * @param {number} param.period The period.E.g. 1,2,3 etc.(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getSnapshot=function(param,callback){
        if(!LOCK_GET_SNAPSHOT){
            console.log("Trying to fetch the snapshot data.");
            if (param.exchange==null) {
                throw "Invalid Parameter/exchange cannot be null.";
            }
            if (param.instrument_identifiers==null) {
                throw "Invalid Parameter/instrument_identifiers cannot be null.";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_SNAPSHOT=true;
            r(5,forceed_exit_time);
            if(Authenticated) {
                snapshot=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetSnapshot(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_SNAPSHOT_RESULT+'"') ){
                            console.log(e.data);
                            snapshot=e.data;
                            count--;
                            LOCK_GET_SNAPSHOT=false;
                            if(callback)
                               callback(snapshot);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(6):1);
            }
        }
    };
     /**
	 * Returns last snapshot of Multiple Symbols (max 25 instruments in single call)
	 * @memberOf DhelmGfeed
	 * @method getHistoricalTick
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {string} param.instrument_identifier The instrument identifier(required).
     * @param {number} param.from The from time in unix timestamp(required).
     * @param {number} param.to The to time in unix timestamp(required).
     * @param {number} param.max Numerical value of maximum records that should be returned. 
     * Default = 0 (means all available data).(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getHistoricalTick=function(param,callback){
        if(!LOCK_GET_HISTORY_TICK){
            console.log("Trying to fetch historical tick data.");
            if (param.exchange==null) {
                throw "Invalid Parameter/exchange cannot be null.";
            }
            if (param.instrument_identifier==null) {
                throw "Invalid Parameter/instrument_identifiers cannot be null.";
            }
            if (param.from==null) {
                throw "Invalid Parameter/from cannot be null.";
            }
            if (param.to==null) {
                throw "Invalid Parameter/to cannot be null.";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_HISTORY_TICK=true;
            r(7.1,forceed_exit_time);
            if(Authenticated) {
                hisotical_tick=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetHistoricalTick(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_HISTORY_TICK_RESULT+'"') ){
                            console.log(e.data);
                            hisotical_tick=e.data;
                            count--;
                            LOCK_GET_HISTORY_TICK=false;
                            if(callback)
                               callback(hisotical_tick);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(7.1):1);
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
        },(count>0)?getSynchronizationDelay(8):1);
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
        },(count>0)?getSynchronizationDelay(9):1);
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
        },(count>0)?getSynchronizationDelay(10):1);
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
                option_types=constants.RESULT_NOT_PREPARED;
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
            },(count>0)?getSynchronizationDelay(11):1);
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
                            strike_prices=e.data;
                            count--;
                            LOCK_GET_STRIKE_PRICES=false;
                            if(callback)
                               callback(strike_prices);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(12):1);
            }
        }
    };
    /**
	 * Get limitations of your subscription plan
	 * @memberOf DhelmGfeed
	 * @method getLimitation
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getLimitation=function(callback){
        if(!LOCK_GET_LIMITATION){
            console.log("Trying to fetch subscription details.");
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_LIMITATION=true;
            r(13,forceed_exit_time);
            if(Authenticated) {
                limitation=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetLimitation();
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_LIMITATION_RESULT+'"') ){
                            console.log(e.data);
                            limitation=e.data;
                            count--;
                            LOCK_GET_LIMITATION=false;
                            if(callback)
                               callback(limitation);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(13):1);
            }
        }
    };
    /**
	 * Get server information
	 * @memberOf DhelmGfeed
	 * @method getServerInfo
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getServerInfo=function(callback){
        if(!LOCK_GET_SERVER_INFO){
            console.log("Trying to fetch server info.");
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_SERVER_INFO=true;
            r(14,forceed_exit_time);
            if(Authenticated) {
                server_info=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetServerInfo();
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_SERVER_INFO_RESULT+'"') ){
                            console.log(e.data);
                            server_info=e.data;
                            count--;
                            LOCK_GET_LIMITATION=false;
                            if(callback)
                               callback(server_info);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(14):1);
            }
        }
    };
    /**
	 * Get market message  for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getMarketMessage
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getMarketMessage=function(param,callback){
        if(!LOCK_GET_MARKET_MESSAGE){
            console.log("Trying to fetch market message.");
            if (param.exchange==null) {
                throw "Invalid Parameter";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_MARKET_MESSAGE=true;
            r(15,forceed_exit_time);
            if(Authenticated) {
                market_message=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetMarketMessage(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_MARKET_MESSAGE_RESULT+'"') ){
                            console.log(e.data);
                            market_message=e.data;
                            count--;
                            LOCK_GET_MARKET_MESSAGE=false;
                            if(callback)
                               callback(market_message);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(15):1);
            }
        }
    };
    /**
	 * Get exchange message  for the given exchange
	 * @memberOf DhelmGfeed
	 * @method getExchangeMessage
     * @param {object} param 
     * @param {string} param.exchange The exchange.
     * @param {function} callback The callback function
	 * @instance
	 */
    this.getExchangeMessage=function(param,callback){
        if(!LOCK_GET_EXCHANGE_MESSAGE){
            console.log("Trying to fetch exchange message.");
            if (param.exchange==null) {
                throw "Invalid Parameter";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_GET_EXCHANGE_MESSAGE=true;
            r(16,forceed_exit_time);
            if(Authenticated) {
                exchange_message=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetExchangeMessage(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_EXCHANGE_MESSAGE_RESULT+'"') ){
                            console.log(e.data);
                            exchange_message=e.data;
                            count--;
                            LOCK_GET_EXCHANGE_MESSAGE=false;
                            if(callback)
                               callback(exchange_message);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(16):1);
            }
        }
    };
    /**
	 * Subscribe to Realtime data, returns market data every tick.
	 * @memberOf DhelmGfeed
	 * @method subscribeRealTime
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {string} param.instrument_identifier The instrument identifier(required).
     * @param {boolean} param.unsubscribe The default is false.Pass true to unsubscribe(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.subscribeRealTime=function(param,callback){
        if(!LOCK_SUBSCRIBE_REALTIME){
            console.log("Subsribe/unsubscribe realtime data.");
            if (param.exchange==null) {
                throw "Invalid Parameter/exchange cannot be null.";
            }
            if (param.instrument_identifier==null) {
                throw "Invalid Parameter/instrument_identifier cannot be null.";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_SUBSCRIBE_REALTIME=true;
            r(17,forceed_exit_time);
            if(Authenticated) {
                real_time_result=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetRealTimeResult(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_REAL_TIME_RESULT+'"') ){
                            console.log(e.data);
                            real_time_result=e.data;
                            count--;
                            LOCK_SUBSCRIBE_REALTIME=false;
                            if(callback)
                               callback(real_time_result);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(17):1);
            }
        }
    };
    /**
	 * Subscribe to Realtime data, returns data at snapshot periodicity.
	 * @memberOf DhelmGfeed
	 * @method subscribeRealTimeSnapshot
     * @param {object} param 
     * @param {string} param.exchange The exchange(required).
     * @param {string} param.instrument_identifier The instrument identifier(required).
     * @param {string} param.periodicity The peridocity.Valid value is either "MINUTE" or "HOUR"(required).
     * @param {boolean} param.unsubscribe The default is false.Pass true to unsubscribe(optional).
     * @param {function} callback The callback function
	 * @instance
	 */
    this.subscribeRealTimeSnapshot=function(param,callback){
        if(!LOCK_SUBSCRIBE_REALTIME_SNAPSHOT){
            console.log("Subsribe/unsubscribe realtime snapshot data.");
            if (param.exchange==null) {
                throw "Invalid Parameter/exchange cannot be null.";
            }
            if (param.instrument_identifier==null) {
                throw "Invalid Parameter/instrument_identifier cannot be null.";
            }
            if (param.periodicity==null) {
                throw "Invalid Parameter/periodicity cannot be null .";
            }
            if(param.periodicity!=constants.HOUR && param.periodicity!=constants.MINUTE){
                throw "The value for periodicity is invalid";
            }
            var forceed_exit_time=Date.now()+FORCED_EXIT_TIMEOUT;        
            count++;
            LOCK_SUBSCRIBE_REALTIME_SNAPSHOT=true;
            r(18,forceed_exit_time);
            if(Authenticated) {
                real_time_snapshot_result=constants.RESULT_NOT_PREPARED;
                setTimeout(function(){
                GetRealTimeSnapshotResult(param);
                ws.onmessage=function(e){
                    if(e!=null){
                        if(e.data.includes('"MessageType":"'+constants.MESSAGE_REAL_TIME_SNAPSHOT_RESULT+'"') ){
                            console.log(e.data);
                            real_time_snapshot_result=e.data;
                            count--;
                            LOCK_SUBSCRIBE_REALTIME_SNAPSHOT=false;
                            if(callback)
                               callback(real_time_snapshot_result);
                        }
                     }
                };
            },(count>0)?getSynchronizationDelay(18):1);
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
            var strMessage = {MessageType: constants.GET_EXCHANGES};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetInstrumentsOnSearch(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_INSTRUMENTS_ON_SEARCH,
                Exchange: param.exchange,
                Search: param.search_word};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetInstruments(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_INSTRUMENTS};
            if(param.exchange!=null)
            strMessage.Exchange= param.exchange;
            if(param.instrument_type!=null)
            strMessage.InstrumentType= param.instrument_type;
            if(param.product!=null)
            strMessage.Product= param.product;
            if(param.expiry!=null)
            strMessage.Expiry= param.expiry;
            if(param.optiontype!=null)
            strMessage.OptionType= param.optiontype;
            if(param.strikeprice!=null)
            strMessage.StrikePrice=param.strikeprice;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetLastQuote(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_LAST_QUOTE,
                          Exchange: param.exchange,
                          InstrumentIdentifier: param.instrument_identifier};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetLastQuoteArray(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_LAST_QUOTE_ARRAY,
                          Exchange: param.exchange
                          };
            var list=[];
            for (var i = 0; i < param.instrument_identifiers.length; i++) {
                var item={};
                item.Value=param.instrument_identifiers[i];
                list.push(item);
            }
            strMessage.InstrumentIdentifiers=list;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetSnapshot(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_SNAPSHOT,
                          Exchange: param.exchange
                          };
            var list=[];
            for (var i = 0; i < param.instrument_identifiers.length; i++) {
                var item={};
                item.Value=param.instrument_identifiers[i];
                list.push(item);
            }
            strMessage.InstrumentIdentifiers=list;
            if(param.periodicity!=null)
            strMessage.Periodicity=param.periodicity;
            if(param.period!=null)
            strMessage.Period=param.period;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetHistoricalTick(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_HISTORY,
                              Exchange:param.exchange,
                              InstrumentIdentifier:param.instrument_identifier,
                              Periodicity:constants.TICK,
                              From:param.from,
                              To:param.to};
            if(param.max!=null){
             strMessage.Max=param.max;
            }
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetInstrumentTypes(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_INSTRUMENT_TYPES,
                          Exchange:param.exchange};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
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
     function GetLimitation(){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_LIMITATIONS,};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetServerInfo(){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_SERVER_INFO,};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetMarketMessage(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_MARKET_MESSAGE,
                          Exchange: param.exchange};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetExchangeMessage(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.GET_EXCHANGE_MESSAGE,
                          Exchange: param.exchange};
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetRealTimeResult(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.SUBSCRIBE_REAL_TIME,
                          Exchange: param.exchange,
                          InstrumentIdentifier: param.instrument_identifier};
            if(param.unsubscribe!=null)
            strMessage.Unsubscribe= param.unsubscribe;
            if(Authenticated){
               callAPI(JSON.stringify(strMessage));
             }
        }
    }
    //
    function GetRealTimeSnapshotResult(param){
        if (ws.OPEN==1) {
            var strMessage = {MessageType:constants.SUBSCRIBE_SNAPSHOT,
                              Exchange: param.exchange,
                              InstrumentIdentifier: param.instrument_identifier,
                              Periodicity:param.periodicity
                          };
            if(param.unsubscribe!=null)
            strMessage.Unsubscribe= param.unsubscribe;
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
      if(previous_call==3|| previous_call==7.1){
        if(Date.now()<SYNCHRONIZATION_EXP){
            fn_call_log(instance_no);
            return ((SYNCHRONIZATION_EXP=SYNCHRONIZATION_EXP+MULTIPLIER*TIMEOUT)-Date.now());
        }
        else{
            fn_call_log(instance_no);
            return ((SYNCHRONIZATION_EXP=Date.now()+MULTIPLIER*TIMEOUT)-Date.now());
        } 
      }
      if(Date.now()<SYNCHRONIZATION_EXP){
          fn_call_log(instance_no);
          return ((SYNCHRONIZATION_EXP=SYNCHRONIZATION_EXP+TIMEOUT)-Date.now());
      }
      else{
          fn_call_log(instance_no);
          return ((SYNCHRONIZATION_EXP=Date.now()+TIMEOUT)-Date.now());
      }
    }
    //
    function fn_call_log(instance_no){
         if(count==0)previous_call=-1;
         else previous_call=instance_no;
    }
    //Function to release an requested resource on predefined time expiration
    function r(fnIndex,forceed_exit_time){
       // console.log("*****************CLOCK STARTED*************************");
        setTimeout(function(){
           if(fnIndex==1 && LOCK_GET_EXCHANGES)LOCK_GET_EXCHANGES=false;
           else if(fnIndex==2 && LOCK_GET_INSTRUMENTS_ON_SEARCH)LOCK_GET_INSTRUMENTS_ON_SEARCH=false;
           else if(fnIndex==3 && LOCK_GET_INSTRUMENTS)LOCK_GET_INSTRUMENTS=false;
           else if(fnIndex==4 && LOCK_GET_LAST_QUOTE)LOCK_GET_LAST_QUOTE=false;
           else if(fnIndex==5 && LOCK_GET_LAST_QUOTE_ARRAY)LOCK_GET_LAST_QUOTE_ARRAY=false;
           else if(fnIndex==6 && LOCK_GET_SNAPSHOT)LOCK_GET_SNAPSHOT=false;
           else if(fnIndex==7.1 && LOCK_GET_HISTORY_TICK)LOCK_GET_HISTORY_TICK=false;
           else if(fnIndex==8 &&LOCK_GET_INSTRUMENTS_TYPES)LOCK_GET_INSTRUMENTS_TYPES=false;
           else if(fnIndex==9 && LOCK_GET_PRODUCTS)LOCK_GET_PRODUCTS=false;
           else if(fnIndex==10 && LOCK_GET_EXPIRY)LOCK_GET_EXPIRY=false;
           else if(fnIndex==11 && LOCK_GET_OPTION_TYPES)LOCK_GET_OPTION_TYPES=false;
           else if(fnIndex==12 && LOCK_GET_STRIKE_PRICES)LOCK_GET_STRIKE_PRICES=false;
           else if(fnIndex==13 && LOCK_GET_LIMITATION)LOCK_GET_LIMITATION=false;
           else if(fnIndex==14 && LOCK_GET_SERVER_INFO)LOCK_GET_SERVER_INFO=false;
           else if(fnIndex==15 && LOCK_GET_MARKET_MESSAGE)LOCK_GET_MARKET_MESSAGE=false;
           else if(fnIndex==16 && LOCK_GET_EXCHANGE_MESSAGE)LOCK_GET_EXCHANGE_MESSAGE=false;
           else if(fnIndex==17 && LOCK_SUBSCRIBE_REALTIME)LOCK_SUBSCRIBE_REALTIME=false;
           else if(fnIndex==18 && LOCK_SUBSCRIBE_REALTIME_SNAPSHOT)LOCK_SUBSCRIBE_REALTIME_SNAPSHOT=false;
        },forceed_exit_time-Date.now());
   }
};
module.exports = DhelmGfeed;