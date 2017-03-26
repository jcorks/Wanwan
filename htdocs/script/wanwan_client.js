Wanwan.Client = {}



Wanwan.Client.index = 0;
Wanwan.Client.ScriptController = {};

// physically send the request to the server
Wanwan.Client.SendRequest = function(str, type) {
    // basic rundown:
    // Request JS to run from the WANWAN server
    // eventually this will populate a single string buffer of hex 
    // to be encoded / decoded in a correct format.

    var controller = Wanwan.Client.ScriptController[type];

    if (controller != null) {
        document.body.removeChild(controller);
    }

    controller    = document.createElement("script");
    controller.id = "WANWAN_js_request";
    controller.setAttribute("type", "text/javascript");


    //console.log("I want to send ->" + str);
    //console.log("(" + Wanwan.Server.Dehexify(str) + ")");

    controller.setAttribute("src", Wanwan.Server.URL+"?"+str);
    controller.setAttribute("async", "async");
    var body = document.body;
    body.appendChild(controller);
    Wanwan.Client.ScriptController[type] = controller
}


// posts a new message to the server
// (the client wont show those changes until acknowledged from the server
Wanwan.Client.Post = function(message) {

    var anime = "Core.Speech";
    if (message.length >= 4 &&
        message[0] == '[' && 
        message[2] == ']') {
        switch(message[1]) {
          case '~': anime = "Core.Wavey"; break;
          case '!': anime = "Core.Shock"; break;
        }

        message = message.substring(3, message.length);
    }

    
    // form basic message
    var out = [];
    out.push("WANWANPOST");
    out.push(Wanwan.Client.userName);
    out.push(message);
    out.push(anime);
    out.push(Wanwan.Client.channelName);


    var str = Wanwan.Server.Hexify(out);
    Wanwan.Client.SendRequest(str, 'Post');


    clearTimeout(Wanwan.Server.NeedsUpdateID);
    Wanwan.Server.NeedsUpdateID = null;
    
}



Wanwan.Client.RequestUpdate = function() {
    var out = [];
    out.push("WANWANUPDT");
    out.push(Wanwan.Client.channelName);
    out.push(Wanwan.Client.index.toString());
 
    var str = Wanwan.Server.Hexify(out);
    Wanwan.Client.SendRequest(str, 'Update');   

}


