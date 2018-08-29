var DhelmGfeed = require("./lib/index").DhelmGfeed;
var wsclient = new DhelmGfeed({
	api_key: "f31b6d7d-0138-428d-93ef-28acbd9632d2",
	ws_url: "ws://nimblestream.lisuns.com:4526/"
});
wsclient.connect();