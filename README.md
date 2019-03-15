# dhelm-gfeed-js-client
Dhelm-gfeed-js-client is a javascript client library to access and integrate stock market data from  
[Global Financial Datafeeds LLP](https://globaldatafeeds.in/) with your application.

To use this library you must [subscribe](https://globaldatafeeds.in/api/) to web socket api with Global Financial Datafeeds LLP and get your API key and web socket endpoint URL. Programmatic access to data obviously provides better control over your algorithm. You access the raw data from your data provider, then feed into your own application and do whatever analysis you want.

Using Dhelm-gfeed-js-client you can plug data from web socket api into your web application directly.

**For detailed integration and usage guidelines, please read through the [wiki](https://github.com/kncsolutions/dhelm-gfeed-js-client/wiki).**
## Installation
npm i dhelmgfeedclient
## Getting started with the client
```javascript
var DhelmGfeed = require("dhelmgfeedclient").DhelmGfeed;
var CONSTANTS = require("dhelmgfeedclient").CONSTANTS;
var wsclient = new DhelmGfeed({
  api_key: "<API_KEY>",
  ws_url: "<WEB_SOCKET_URL>",
});

//Example with call back
wsclient.connect(onconnected);
function onconnected(isauthenticated){
    if(isauthenticated==true){
       //your staff goes here
    }
}
```
## How to run the test file
Git clone the repository to your pc. Make sure that Node js and NPM is installed.
Naviagate to the folder where package.json is located. Open the command prompt there.
First run the command **npm install**.
Open the -**gfeedclienttest.js**- file in your favourite text editor and replace the -**<API_KEY>**- with your api key. Replace the -**<WEB_SOCKET_URL>**- with the websocket url.To run the test file navigate to the folder
```javascript
var wsclient = new DhelmGfeed({
  api_key: "<API_KEY>",
  ws_url: "<WEB_SOCKET_URL>",
  synchronization_delay:2000
});
```
Then run the command **node gfeedclienttest.js**
### API doc
Read the api doc [here](https://kncsolutions.github.io/site/gfeedjsclient/docs/dhelmgfeedclient/1.0.2/).

If you have any query raise an [issue](https://github.com/kncsolutions/dhelm-gfeed-client/issues)

