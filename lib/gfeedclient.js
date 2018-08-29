var WebSocket = require("ws");
var constants = require("./constants");
var url="";
var api_key="";
var Authenticated = false;
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
    console.log(url);
    console.log(api_key);
    
    this.connect = function() {
        if(ws && (ws.readyState == ws.CONNECTING || ws.readyState == ws.OPEN)) return;
        ws = new WebSocket(url);
        ws.onopen = function() {
            console.log('Client Connected!');
            Authenticate();
        };
        ws.onmessage=function(e){
            console.log(e.data);
        };
    };
    function Authenticate() {		
        if (ws.OPEN==1) {
            strMessage = '{"MessageType":"'+constants.AUTHENTICATE+'","Password":"' + api_key + '"}'
            if(!Authenticated)
			   callAPI(strMessage);
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