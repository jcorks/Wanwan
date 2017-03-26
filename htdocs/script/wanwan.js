var Wanwan = {};
///////////////////////////////////// 
///////// Public interface ///////////

Wanwan.Init = function(canvasElementID, serverCoreURL){}


// usually done for you, but maybe be needed for special situations
// and external events. A "soft update" redraws the chat's framebuffer.
// This is far quicker than a full update 
Wanwan.SoftUpdate = function(){}


Wanwan.FullUpdate = function(){}

// Sets the name that the client will have during chat
//
Wanwan.Name = function(name){}


// Sets the name of the current channel
//
Wanwan.Channel = function(name){}






////////////////////////////////////
////////////////////////////////////






























Wanwan.Init = function(canvasID, serverCGIURL) {
    Wanwan.Canvas.Element = document.getElementById(canvasID);
    Wanwan.Canvas.Context = Wanwan.Canvas.Element.getContext("2d");
    Wanwan.Server.URL = serverCGIURL;
    Wanwan.Name("Potato");
    Wanwan.Channel("Lobby");

    setInterval(Wanwan.Server.Check, 300);



}


Wanwan.Name  = function(realName) {
    Wanwan.Client.userName = realName;
}
Wanwan.Channel = function(channelName) {
    if (Wanwan.Client.channelName != channelName) {
        Wanwan.Canvas.ClearText();
    }
    Wanwan.Client.channelName = channelName;
}


Wanwan.SoftUpdate = function() {
    if (Wanwan.Canvas.Context == null) return;
    Wanwan.Canvas.Update();
}

Wanwan.FullUpdate = function() {
    if (Wanwan.Canvas.Context == null) return;
    Wanwan.Canvas.UpdateFramebuffer();
}


Wanwan.Input = function(event) {
    if (event.keyCode == 13) {
        
        
        Wanwan.Name(textContent = document.getElementById("nameEntry").value); 
        textContent = document.getElementById("command").value; 
        document.getElementById("command").value = "";
        /*

        Wanwan.Canvas.AddText(
            "Test", textContent,
            "#FFF",
            "Core.Wavey"
        );
        */
        Wanwan.Client.Post(textContent);
    }
    
}

