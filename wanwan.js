function Wanwan(serverCoreURL){};





//////////////////////////////////////
///////// Public interface ///////////


// initialized Wanwan and it's utilities.
// canvasElementID should refer to the id name of the HTML element 
// containing a cnavas to use. If a non-existent element is given, 
// Wanwan is started in non-canvas mode. In non-canvas mode,
// No canvas-related functionality is done. This is useful if you just want 
// to receive messages and implement your own front-end.
Wanwan.prototype.Start = function(){}



// Sets the name that the client will have during chat
//
Wanwan.prototype.Name = function(name){}


// Sets the name of the current channel.
//
Wanwan.prototype.Channel = function(name){}


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
Wanwan.prototype.Send = function(messageText){}



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
//      "server-accept"    function()
//  
//          Called when the intial connection to the server is successful
//
//      "server-deny"       function()
//
//          Called in the case that, when first attempting to connect, the server 
//          identifies the client as incompatible. Usually this is a versioning issue.
//
//      "server-message"    function(user, message, color)
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
Wanwan.prototype.Bind = function(signalName, handler){}


// Removes a binding
Wanwan.prototype.Unbind = function(bindingID){};





// Queries the rooms available on the server.
// The responseFunc is called with an array to the room names 
// when / if the response is processed.
Wanwan.prototype.QueryAvailableChannels = function(responseFunc){}

































function Wanwan(serverCGIURL) {
    this.Server.URL = serverCGIURL;
}

Wanwan.prototype.Start = function() {

    var ref = this;

    ref.Bind("server-accept", function(){
        ref.ConnectClient();
        return true;
    });

    ref.Bind("client-message", function(message){
        ref.ClientPost(message);
        return true;
    });

    ref.Bind("channel-change", function(channelName){
        ref.Client.channelName = channelName;
        return true;
    });


    ref.Name("Potato");
    ref.Channel("Lobby");
    ref.Bindings.Resolve("initialize");


    // send initiale request 
    var out = [];
    out.push("WANWANSQRY");
    out.push("" + 0); // version of the client.
    var str = ref.Hexify(out);
    ref.SendClientRequest(str, 'Post');

}


Wanwan.prototype.Name  = function(realName) {
    this.Client.userName = realName;
}
Wanwan.prototype.Channel = function(channelName) {
    this.Bindings.Resolve("channel-change", [channelName]);
}

Wanwan.prototype.Send = function(message) {
    this.Bindings.Resolve("client-message", [message]);
}


Wanwan.prototype.Bind = function(signalName, handler) {
    var bindID = {};
    var bindList = this.Bindings[signalName];
    if (bindList == null) {
        this.Bindings[signalName] = [];
        var bindList = this.Bindings[signalName];
    }

    bindID.signal = signalName;
    bindID.id     = handler;

        
    bindList.reverse();
    bindList.push(handler);
    bindList.reverse();

    return bindID;
}


Wanwan.prototype.Unbind = function(bindID) {
    if (bindID == null) return;
    var bindList = this.Bindings[bindID.signal];
    if (!bindList) return;
    
    for(var i = 0; i < bindList.length; ++i) {
        if (bindList[i] == bindID.id)
            bindList.splice(i, 1);
    }
}



// bindings control signals
Wanwan.prototype.Bindings = {};

Wanwan.prototype.Bindings.Resolve = function(signal, args) {
    var bindings = this[signal];
    if (bindings == null) return; // throw error ideally
    if (!bindings.length) return;

    for(var i = bindings.length-1; i >= 0; --i) {
        if (!bindings[i].apply(this, args)) return;
    }
}




///////////// CLIENT /////////////////

Wanwan.prototype.Client = {}



Wanwan.prototype.Client.index = 0;
Wanwan.prototype.Client.UpdateRequest = null;

Wanwan.prototype.ConnectClient = function() {
    var ref = this;
    setInterval(function(){
        ref.RequestClientUpdate();
    }, 8500);
    ref.RequestClientUpdate();
}


// physically send the request to the server
Wanwan.prototype.SendClientRequest = function(str, type) {
    // basic rundown:
    // Request JS to run from the WANWAN server
    // eventually this will populate a single string buffer of hex 
    // to be encoded / decoded in a correct format.
    // We should always have an update request active
    // that the server is serving.

    // posts cancel Updates
    if (type == 'Update' && this.Client.UpdateRequest) {
        this.Client.UpdateRequest.abort();
    }

    var ref = this;
    


    var req = new XMLHttpRequest();
    req.open('POST', this.Server.URL+"?", true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200) {
                
                var respArray = req.responseText.split("\n");
                for(var i = 0; i < respArray.length; ++i) {
                    ref.Server.Messages.push(respArray[i]);
                }
                ref.CheckServer();

                if (!ref.Server.initialized) return;
                ref.RequestClientUpdate();
    
                // put in messages and resolve messages
            }

            if (req == ref.Client.UpdateRequest)
                ref.Client.UpdateRequest = null;

            
        }
    }
    req.send(str.length.toString() + "&" + str);

    if (type == 'Update') {
        ref.Client.UpdateRequest = req;
    }

}




// posts a new message to the server
// (the client wont show those changes until acknowledged from the server
Wanwan.prototype.ClientPost = function(message) {

    


    
    // form basic message
    var out = [];
    out.push("WANWANPOST");
    out.push(this.Client.userName);
    out.push(encodeURIComponent(message));
    out.push(this.Client.channelName);


    var str = this.Hexify(out);
    this.SendClientRequest(str, 'Post');

    clearTimeout(this.Server.NeedsUpdateID);
    this.Server.NeedsUpdateID = null;

    return true;
    
}



Wanwan.prototype.RequestClientUpdate = function() {
    var out = [];
    out.push("WANWANUPDT");
    out.push(this.Client.channelName);
    out.push(this.Client.index.toString());
 
    var str = this.Hexify(out);
    this.SendClientRequest(str, 'Update');   

}




///////////////////// SERVER ///////////////////


Wanwan.prototype.Server = {};
Wanwan.prototype.Server.URL = "";
Wanwan.prototype.Server.Messages = [];
Wanwan.prototype.Server.initialized = false;






Wanwan.prototype.CheckServer = function() {


    if (!this.Server.Messages.length) return;
    for(var i = 0; i < this.Server.Messages.length; ++i) {
        if (this.Server.Messages[i].length == 0) continue;
        //console.log("From the server: " + Wanwan.Server.Messages[i]);
        var packet = this.Dehexify(this.Server.Messages[i]);

        switch(packet[0]) {

          case "WANWANMSG":
            if (packet.length != 5) continue;
            if (this.Client.index >= parseInt(packet[4])) continue;
            this.Bindings.Resolve("server-message", 
                [
                    packet[1],  // user
                    decodeURIComponent(packet[2]),  // message
                    packet[3]  // color
                ]
            );
            this.Client.index = parseInt(packet[4]);

            break;

          case "WANWANOKAY":
            if (this.Server.initialized) continue; // Pretty fishy if you ask me
            this.Server.initialized = true;
            this.Bindings.Resolve("server-accept");
            break;


          case "WANWANDENY":
            if (this.Server.initialized) continue; // also pretty fishy
            console.log("Wanwan: Client version isn't supported.");
            this.Bindings.Resolve("server-deny");
            break;

          default:;

        }      

    }
    this.Bindings.Resolve("server-response");
    this.Server.Messages = [];
};





Wanwan.prototype.HexLookup = [];
for(var i = 0; i < 103; ++i) Wanwan.prototype.HexLookup.push(0);
Wanwan.prototype.HexLookup[48] = 0;
Wanwan.prototype.HexLookup[49] = 1;
Wanwan.prototype.HexLookup[50] = 2;
Wanwan.prototype.HexLookup[51] = 3;
Wanwan.prototype.HexLookup[52] = 4;
Wanwan.prototype.HexLookup[53] = 5;
Wanwan.prototype.HexLookup[54] = 6;
Wanwan.prototype.HexLookup[55] = 7;
Wanwan.prototype.HexLookup[56] = 8;
Wanwan.prototype.HexLookup[57] = 9;

Wanwan.prototype.HexLookup[97] = 10;
Wanwan.prototype.HexLookup[98] = 11;
Wanwan.prototype.HexLookup[99] = 12;
Wanwan.prototype.HexLookup[100] = 13;
Wanwan.prototype.HexLookup[101] = 14;
Wanwan.prototype.HexLookup[102] = 15;



Wanwan.prototype.HexToUint8 = function(string) {
    return this.HexLookup[string.charCodeAt(0)]*16 +
           this.HexLookup[string.charCodeAt(1)];
}
Wanwan.prototype.Dehexify = function(string) {
    
    var out = [];
    var item;
    var n;
    var value;
    for(var i = 0; i < string.length; i+=2) {
        item = "";

        // shoudl always start with a 00
        value = this.HexToUint8(string.substring(i, i+2));
        if (value != 0) return [];
        i += 2;

        value = this.HexToUint8(string.substring(i, i+2));        
        while(value != 0 && i < string.length) {
            item += String.fromCharCode(value);
            i += 2;
            value = this.HexToUint8(string.substring(i, i+2));
        }

        // we ended but without a 00
        if (value != 0) 
            return [];

        out.push(item);
    }
    return out;
}


Wanwan.prototype.ReverseHexLookup = [];
Wanwan.prototype.ReverseHexLookup[0] = "0";
Wanwan.prototype.ReverseHexLookup[1] = "1";
Wanwan.prototype.ReverseHexLookup[2] = "2";
Wanwan.prototype.ReverseHexLookup[3] = "3";
Wanwan.prototype.ReverseHexLookup[4] = "4";
Wanwan.prototype.ReverseHexLookup[5] = "5";
Wanwan.prototype.ReverseHexLookup[6] = "6";
Wanwan.prototype.ReverseHexLookup[7] = "7";
Wanwan.prototype.ReverseHexLookup[8] = "8";
Wanwan.prototype.ReverseHexLookup[9] = "9";

Wanwan.prototype.ReverseHexLookup[10] = "a";
Wanwan.prototype.ReverseHexLookup[11] = "b";
Wanwan.prototype.ReverseHexLookup[12] = "c";
Wanwan.prototype.ReverseHexLookup[13] = "d";
Wanwan.prototype.ReverseHexLookup[14] = "e";
Wanwan.prototype.ReverseHexLookup[15] = "f";

Wanwan.prototype.Uint8ToHex = function(value) {
    if (value > 255) value = 255;
    return this.ReverseHexLookup[Math.floor(value/16)] +
           this.ReverseHexLookup[value%16];
}

Wanwan.prototype.Hexify = function(argvec) {
    var str = "";
    for(var i = 0; i < argvec.length; ++i) {
        str += "00";
        for(var n = 0; n < argvec[i].length; ++n) {
            str += this.Uint8ToHex(argvec[i].charCodeAt(n));
        }
        str += "00";
    }
    return str;
}






