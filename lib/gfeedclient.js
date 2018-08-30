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
        if(Authenticated) {
            subscribed_exchanges=null;
            GetSubscribedExchanges();
            ws.onmessage=function(e){
                if(e!=null){
                    if(e.data.includes('"MessageType":"'+constants.MESSAGE_EXCHANGE_RESULT+'"') ){
                        console.log(e.data);
                        subscribrd_exchanges=e.data;
                        if(callback)
                           callback(subscribrd_exchanges);
                    }
                 }
            };
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
        if(Authenticated) {
            instrument_types=null;
            GetInstrumentTypes(param);
            ws.onmessage=function(e){
                if(e!=null){
                    if(e.data.includes('"MessageType":"'+constants.MESSAGE_INSTRUMENT_TYPES_RESULT+'"') ){
                        console.log(e.data);
                        instrument_types=e.data;
                        if(callback)
                           callback(instrument_types);
                    }
                 }
            };
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
    function callAPI(request){
		console.log("request: *****" + request + "*****");
		if (ws.OPEN) {
            ws.send(request);
        }
    }
};
module.exports = DhelmGfeed;