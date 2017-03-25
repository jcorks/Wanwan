Wanwan.Client = {}

Wanwan.Client.name  = "ExampleUser";
Wanwan.Client.color = "#CDE";



// posts a new message to the server
// (the client wont show those changes until acknowledged from the server
Wanwan.Client.Post = function(message) {


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


    // form basic message
    var out = [];
    out.push("WANWANPOST");
    out.push("DaUser");
    out.push(message);
    out.push("Core.Speech");


    var str = Wanwan.Server.Hexify(out);
    console.log("I want to send ->" + str);
    
    Wanwan.Client.ScriptController.setAttribute("src", Wanwan.Server.URL+"?"+str);
    
    var body = document.body;
    body.appendChild(Wanwan.Client.ScriptController);
}

