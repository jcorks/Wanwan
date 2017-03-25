Wanwan.Client = {}

Wanwan.Client.name  = "ExampleUser";
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
    var body = document.body;
    body.appendChild(Wanwan.Client.ScriptController);
}


// posts a new message to the server
// (the client wont show those changes until acknowledged from the server
Wanwan.Client.Post = function(message) {

    
    // form basic message
    var out = [];
    out.push("WANWANPOST");
    out.push("TestUser");
    out.push(message);
    out.push("Core.Speech");
    out.push("test");


    var str = Wanwan.Server.Hexify(out);
    Wanwan.Client.SendRequest(str);
    
}



Wanwan.Client.RequestUpdate = function() {
    var out = [];
    out.push("WANWANUPDT");
    out.push("test");
    out.push(Wanwan.Client.index.toString());
 
    var str = Wanwan.Server.Hexify(out);
    Wanwan.Client.SendRequest(str);   
}


