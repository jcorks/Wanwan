var Wanwan = {};
Wanwan.Canvas = {};




//////////////////////////////////////
///////// Public interface ///////////


// initialized Wanwan and it's utilities.
// canvasElementID should refer to the id name of the HTML element 
// containing a cnavas to use. If a non-existent element is given, 
// Wanwan is started in non-canvas mode. In non-canvas mode,
// No canvas-related functionality is done. This is useful if you just want 
// to receive messages and implement your own front-end.
Wanwan.Start = function(serverCoreURL){}



// Sets the name that the client will have during chat
//
Wanwan.Name = function(name){}


// Sets the name of the current channel.
//
Wanwan.Channel = function(name){}


// Sends a message to the current channel as the current user.
// If the message is led by "[*]" where * is a recognized animation symbol, 
// the remainder of the message is interpreted as a specific type of animation 
// that is shown when displayed for all users. Here are the recognized characters
// for animations:
//
//      [~]    Makes the text all wavey
//      [!]    Makes the text all shakey 
//
// By default, the shown animation is rolling text style. If an unknown 
// animation is given, the text is instantly displayed. 
Wanwan.Post = function(messageText){}



// Binds an additional function to a signal
//
//  Wanwan.Bind("new-message", function(user, messsage, color, animationName)){
//      console.log("User " + user + " says: '" + message + "' in the formatted color " + color + " with animation " + animationName);
//  });
//
// would print a log line with all the message available from a bind.
// Since multiple binds can be called, each handler for a bind can 
// return whether to propogate the handling of the signal. If true is returned, 
// the signal continues propogation. If false, the signal is no longer propogated.
// Note that that the propogation order is based on the order in which it was bound
// where the first bound signal handler is the last to be processed and the most recent 
// the first. The API may invoke default handler
//
// Available signals:
//
//  
//      "server-message"    function(user, message, color, animationName)
//
//          Called when the server sends over a broadcasted message that 
//          the client hasn't seen yet.
//
//      "client-message"    function(message)
//      
//          Called before the client sends over a new message to the channel 
//          to broadcast. The default signal handler controls the sending of the message,
//          so a bound user handler that returns false will prevent the message from 
//          broadcasting.
//
//      "initialize"        function()
//  
//          Called when the client first connects to the server
//
//
//      "channel-change"    function(newChannel)
//          
//          Called when the client requests to change channels.
//
//      "server-response"
//          
//          Called when the client has received contact from the server.
//
// On return, a binding ID is returned. This can be used to unbind the signal.
Wanwan.Bind = function(signalName, handler){}


// Removes a binding
Wanwan.Unbind = function(bindingID){};





// Queries the rooms available on the server.
// The responseFunc is called with an array to the room names 
// when / if the response is processed.
Wanwan.QueryAvailableChannels = function(responseFunc){}



































Wanwan.Start = function(serverCGIURL) {
    Wanwan.Bind("client-message", Wanwan.Client.Post);
    Wanwan.Bind("channel-change", function(channelName){
        Wanwan.Client.channelName = channelName;
        return true;
    });

    Wanwan.Server.URL = serverCGIURL;
    Wanwan.Name("Potato");
    Wanwan.Channel("Lobby");
    setInterval(Wanwan.Client.RequestUpdate, 8500);
    Wanwan.Client.RequestUpdate();

    Wanwan.Bindings.Resolve("initialize");
}


Wanwan.Name  = function(realName) {
    Wanwan.Client.userName = realName;
}
Wanwan.Channel = function(channelName) {
    Wanwan.Bindings.Resolve("channel-change", [channelName]);
}

Wanwan.Post = function(message) {
    Wanwan.Bindings.Resolve("client-message", [message]);
}


Wanwan.Bind = function(signalName, handler) {
    var bindID = {};
    var bindList = Wanwan.Bindings[signalName];
    if (bindList == null) {
        Wanwan.Bindings[signalName] = [];
        var bindList = Wanwan.Bindings[signalName];
    }

    bindID.signal = signalName;
    bindID.id     = handler;

        
    bindList.reverse();
    bindList.push(handler);
    bindList.reverse();

    return bindID;
}


Wanwan.Unbind = function(bindID) {
    if (bindID == null) return;
    var bindList = Wanwan.Bindings[bindID.signal];
    if (!bindList) return;
    
    for(var i = 0; i < bindList.length; ++i) {
        if (bindList[i] == bindID.id)
            bindList.splice(i, 1);
    }
}



// bindings control signals
Wanwan.Bindings = {};

Wanwan.Bindings.Resolve = function(signal, args) {
    var bindings = Wanwan.Bindings[signal];
    if (bindings == null) return; // throw error ideally
    if (!bindings.length) return;

    for(var i = bindings.length-1; i >= 0; --i) {
        if (!bindings[i].apply(this, args)) return;
    }
}




///////////// CLIENT /////////////////

Wanwan.Client = {}



Wanwan.Client.index = 0;
Wanwan.Client.UpdateRequest = null;

// physically send the request to the server
Wanwan.Client.SendRequest = function(str, type) {
    // basic rundown:
    // Request JS to run from the WANWAN server
    // eventually this will populate a single string buffer of hex 
    // to be encoded / decoded in a correct format.


    // posts cancel Updates
    if (Wanwan.Client.UpdateRequest) {
        Wanwan.Client.UpdateRequest.abort();
    }

    


    var req = new XMLHttpRequest();
    req.open('POST', Wanwan.Server.URL+"?", true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200) {
                
                var respArray = req.responseText.split("\n");
                for(var i = 0; i < respArray.length; ++i) {
                    Wanwan.Server.Messages.push(respArray[i]);
                }
                Wanwan.Server.Check();
                Wanwan.Client.RequestUpdate();
    
                // put in messages and resolve messages
            }

            if (req == Wanwan.Client.UpdateRequest)
                Wanwan.Client.UpdateRequest = null;

            
        }
    }
    req.send(str.length.toString() + "&" + str);

    if (type == 'Update') {
        Wanwan.Client.UpdateRequest = req;
    } else if (type == 'Post') {
        Wanwan.Client.RequestUpdate();
    }

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
    out.push(encodeURIComponent(message));
    out.push(anime);
    out.push(Wanwan.Client.channelName);


    var str = Wanwan.Server.Hexify(out);
    Wanwan.Client.SendRequest(str, 'Post');


    clearTimeout(Wanwan.Server.NeedsUpdateID);
    Wanwan.Server.NeedsUpdateID = null;

    return true;
    
}



Wanwan.Client.RequestUpdate = function() {
    var out = [];
    out.push("WANWANUPDT");
    out.push(Wanwan.Client.channelName);
    out.push(Wanwan.Client.index.toString());
 
    var str = Wanwan.Server.Hexify(out);
    Wanwan.Client.SendRequest(str, 'Update');   

}




///////////////////// SERVER ///////////////////


Wanwan.Server = {};
Wanwan.Server.URL = "";
Wanwan.Server.Messages = [];







Wanwan.Server.Check = function() {


    if (!Wanwan.Server.Messages.length) return;
    for(var i = 0; i < Wanwan.Server.Messages.length; ++i) {
        if (Wanwan.Server.Messages[i].length == 0) continue;
        //console.log("From the server: " + Wanwan.Server.Messages[i]);
        var packet = Wanwan.Server.Dehexify(Wanwan.Server.Messages[i]);

        switch(packet[0]) {

          case "WANWANMSG":
            if (packet.length != 6) continue;
            if (Wanwan.Client.index >= parseInt(packet[5])) continue;
            Wanwan.Bindings.Resolve("server-message", 
                [
                    packet[1],  // user
                    decodeURIComponent(packet[2]),  // message
                    packet[3],  // color
                    Wanwan.Server.Messages.length > 8 ? "Default" : packet[4]
                ]
            );
            Wanwan.Client.index = parseInt(packet[5]);

            break;
          default:;
        }      

    }
    Wanwan.Bindings.Resolve("server-response");
    Wanwan.Server.Messages = [];
};





Wanwan.Server.HexLookup = [];
for(var i = 0; i < 103; ++i) Wanwan.Server.HexLookup.push(0);
Wanwan.Server.HexLookup[48] = 0;
Wanwan.Server.HexLookup[49] = 1;
Wanwan.Server.HexLookup[50] = 2;
Wanwan.Server.HexLookup[51] = 3;
Wanwan.Server.HexLookup[52] = 4;
Wanwan.Server.HexLookup[53] = 5;
Wanwan.Server.HexLookup[54] = 6;
Wanwan.Server.HexLookup[55] = 7;
Wanwan.Server.HexLookup[56] = 8;
Wanwan.Server.HexLookup[57] = 9;

Wanwan.Server.HexLookup[97] = 10;
Wanwan.Server.HexLookup[98] = 11;
Wanwan.Server.HexLookup[99] = 12;
Wanwan.Server.HexLookup[100] = 13;
Wanwan.Server.HexLookup[101] = 14;
Wanwan.Server.HexLookup[102] = 15;



Wanwan.Server.HexToUint8 = function(string) {
    return Wanwan.Server.HexLookup[string.charCodeAt(0)]*16 +
           Wanwan.Server.HexLookup[string.charCodeAt(1)];
}
Wanwan.Server.Dehexify = function(string) {
    
    var out = [];
    var item;
    var n;
    var value;
    for(var i = 0; i < string.length; i+=2) {
        item = "";

        // shoudl always start with a 00
        value = Wanwan.Server.HexToUint8(string.substring(i, i+2));
        if (value != 0) return [];
        i += 2;

        value = Wanwan.Server.HexToUint8(string.substring(i, i+2));        
        while(value != 0 && i < string.length) {
            item += String.fromCharCode(value);
            i += 2;
            value = Wanwan.Server.HexToUint8(string.substring(i, i+2));
        }

        // we ended but without a 00
        if (value != 0) 
            return [];

        out.push(item);
    }
    return out;
}


Wanwan.Server.ReverseHexLookup = [];
Wanwan.Server.ReverseHexLookup[0] = "0";
Wanwan.Server.ReverseHexLookup[1] = "1";
Wanwan.Server.ReverseHexLookup[2] = "2";
Wanwan.Server.ReverseHexLookup[3] = "3";
Wanwan.Server.ReverseHexLookup[4] = "4";
Wanwan.Server.ReverseHexLookup[5] = "5";
Wanwan.Server.ReverseHexLookup[6] = "6";
Wanwan.Server.ReverseHexLookup[7] = "7";
Wanwan.Server.ReverseHexLookup[8] = "8";
Wanwan.Server.ReverseHexLookup[9] = "9";

Wanwan.Server.ReverseHexLookup[10] = "a";
Wanwan.Server.ReverseHexLookup[11] = "b";
Wanwan.Server.ReverseHexLookup[12] = "c";
Wanwan.Server.ReverseHexLookup[13] = "d";
Wanwan.Server.ReverseHexLookup[14] = "e";
Wanwan.Server.ReverseHexLookup[15] = "f";

Wanwan.Server.Uint8ToHex = function(value) {
    if (value > 255) value = 255;
    return Wanwan.Server.ReverseHexLookup[Math.floor(value/16)] +
           Wanwan.Server.ReverseHexLookup[value%16];
}

Wanwan.Server.Hexify = function(argvec) {
    var str = "";
    for(var i = 0; i < argvec.length; ++i) {
        str += "00";
        for(var n = 0; n < argvec[i].length; ++n) {
            str += Wanwan.Server.Uint8ToHex(argvec[i].charCodeAt(n));
        }
        str += "00";
    }
    return str;
}






