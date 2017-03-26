Wanwan.Client = {}



Wanwan.Client.color = "#CDE";
Wanwan.Client.index = 0;

// physically send the request to the server
Wanwan.Client.SendRequest = function(str) {
    // basic rundown:
    // Request JS to run from the WANWAN server
    // eventually this will populate a single string buffer of hex 
    // to be encoded / decoded in a correct format.


    if (Wanwan.Client.ScriptController != null) {
        document.body.removeChild(Wanwan.Client.ScriptController);
    }

    Wanwan.Client.ScriptController    = document.createElement("script");
    Wanwan.Client.ScriptController.id = "WANWAN_post_widget";
    Wanwan.Client.ScriptController.setAttribute("type", "text/javascript");


    //console.log("I want to send ->" + str);
    //console.log("(" + Wanwan.Server.Dehexify(str) + ")");

    Wanwan.Client.ScriptController.setAttribute("src", Wanwan.Server.URL+"?"+str);
    Wanwan.Client.ScriptController.setAttribute("async", "async");
    var body = document.body;
    body.appendChild(Wanwan.Client.ScriptController);
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
    Wanwan.Client.SendRequest(str);
    
}



Wanwan.Client.RequestUpdate = function() {
    var out = [];
    out.push("WANWANUPDT");
    out.push(Wanwan.Client.channelName);
    out.push(Wanwan.Client.index.toString());
 
    var str = Wanwan.Server.Hexify(out);
    Wanwan.Client.SendRequest(str);   
}


