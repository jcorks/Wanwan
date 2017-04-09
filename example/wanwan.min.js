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
    this.signal = new WanwanRelay();
    this.client = new WanwanClient(serverCGIURL);

    var ref = this;


    // set up signals
    this.client.onWANWANMSG = function(user, message, color) {
        ref.signal.Resolve("server-message", [user, message, color]);
    };

    this.client.onWANWANOKAY = function() {
        ref.signal.Resolve("server-accept");
    };

    this.client.onWANWANDENY = function() {
        ref.signal.Resolve("server-deny");
    }

    this.client.onServerResponse = function() {
        ref.signal.Resolve("server-response");
    }
}

Wanwan.prototype.Start = function() {

    var ref = this;





    ref.Bind("client-message", function(message){
        ref.client.Post(message);
        return true;
    });

    ref.Bind("channel-change", function(channelName){
        ref.client.channelName = channelName;
        return true;
    });


    ref.Name("Potato");
    ref.Channel("Lobby");
    ref.signal.Resolve("initialize");
    ref.client.Connect();
}


Wanwan.prototype.Name  = function(realName) {
    this.client.userName = realName;
}
Wanwan.prototype.Channel = function(channelName) {
    this.signal.Resolve("channel-change", [channelName]);
}

Wanwan.prototype.Send = function(message) {
    this.signal.Resolve("client-message", [message]);
}


Wanwan.prototype.Bind = function(signalName, handler) {
    return this.signal.Bind(signalName, handler)
}


Wanwan.prototype.Unbind = function(bindID) {
    this.signal.Unbind(bindID);
}









//////////////////////////////////////
//// WanwanRelay  - Event binding controller

function WanwanRelay() {
    this.signals = {};
}


WanwanRelay.prototype.Bind = function(signalName, handler) {
    var bindID = {};
    var bindList = this.signals[signalName];
    if (bindList == null) {
        this.signals[signalName] = [];
        var bindList = this.signals[signalName];
    }

    bindID.signal = signalName;
    bindID.id     = handler;

        
    bindList.reverse();
    bindList.push(handler);
    bindList.reverse();

    return bindID;
}   

WanwanRelay.prototype.Unbind = function(bindID) {
    if (bindID == null) return;
    var bindList = this.signals[bindID.signal];
    if (!bindList) return;
    
    for(var i = 0; i < bindList.length; ++i) {
        if (bindList[i] == bindID.id)
            bindList.splice(i, 1);
    }
}

WanwanRelay.prototype.Resolve = function(signal, args) {
    var bindings = this.signals[signal];
    if (bindings == null) return; // throw error ideally
    if (!bindings.length) return;

    for(var i = bindings.length-1; i >= 0; --i) {
        if (!bindings[i].apply(this, args)) return;
    }
}










///////////////////////
///// WanwanIO Data encoder/decoder object
////
//// Used to convert arbitrary text (and potentially binary) data 
//// to and from ascii. 
function WanwanIO() {
    this.fromHex = [];
    for(var i = 0; i < 103; ++i) this.fromHex.push(0);
    this.fromHex[48] = 0;
    this.fromHex[49] = 1;
    this.fromHex[50] = 2;
    this.fromHex[51] = 3;
    this.fromHex[52] = 4;
    this.fromHex[53] = 5;
    this.fromHex[54] = 6;
    this.fromHex[55] = 7;
    this.fromHex[56] = 8;
    this.fromHex[57] = 9;

    this.fromHex[97] = 10;
    this.fromHex[98] = 11;
    this.fromHex[99] = 12;
    this.fromHex[100] = 13;
    this.fromHex[101] = 14;
    this.fromHex[102] = 15;

    this.toHex = [];
    this.toHex[0] = "0";
    this.toHex[1] = "1";
    this.toHex[2] = "2";
    this.toHex[3] = "3";
    this.toHex[4] = "4";
    this.toHex[5] = "5";
    this.toHex[6] = "6";
    this.toHex[7] = "7";
    this.toHex[8] = "8";
    this.toHex[9] = "9";

    this.toHex[10] = "a";
    this.toHex[11] = "b";
    this.toHex[12] = "c";
    this.toHex[13] = "d";
    this.toHex[14] = "e";
    this.toHex[15] = "f";

}





WanwanIO.prototype.HexToUint8 = function(string) {
    return this.fromHex[string.charCodeAt(0)]*16 +
           this.fromHex[string.charCodeAt(1)];
}
WanwanIO.prototype.Dehexify = function(string) {
    
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




WanwanIO.prototype.Uint8ToHex = function(value) {
    if (value > 255) value = 255;
    return this.toHex[Math.floor(value/16)] +
           this.toHex[value%16];
}

WanwanIO.prototype.Hexify = function(argvec) {
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











//////////////////////////////////////////
///////////// WanwanClient - controls network interactions with the server

function WanwanClient(cgiURL) {
    this.index           = 0;
    this.updateRequest   = null;   
    this.updateCycleTime = 8500; 


    this.url = cgiURL;
    this.messages = [];
    this.initialized = false;

    this.userName   = "Anon.";
    this.channelName = "Lobby";


    this.onWANWANMSG  = function(name, message, color){};
    this.onWANWANOKAY = function(){};
    this.onWANWANDENY = function(){};
    this.onServerResponse = function(){};
}

// IO just needs to be initialized once.
WanwanClient.prototype.io = new WanwanIO();



WanwanClient.prototype.Connect = function() {
    // send initial request 
    var out = [];
    out.push("WANWANSQRY");
    out.push("" + 0); // version of the client.
    var str = this.io.Hexify(out);
    this.SendRequest(str, 'Post');

}


// physically send the request to the server
WanwanClient.prototype.SendRequest = function(str, type) {
    // basic rundown:
    // Request JS to run from the WANWAN server
    // eventually this will populate a single string buffer of hex 
    // to be encoded / decoded in a correct format.
    // We should always have an update request active
    // that the server is serving.

    // posts cancel Updates
    if (type == 'Update' && this.updateRequest) {
        this.updateRequest.abort();
    }

    var ref = this;
    


    var req = new XMLHttpRequest();
    req.open('POST', this.url+"?", true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200) {
                
                var respArray = req.responseText.split("\n");
                for(var i = 0; i < respArray.length; ++i) {
                    ref.messages.push(respArray[i]);
                }
                ref.CheckServer();

                if (!ref.initialized) return;
                ref.RequestUpdate();
    
                // put in messages and resolve messages
            }

            if (req == ref.updateRequest)
                ref.updateRequest = null;

            
        }
    }
    req.send(str.length.toString() + "&" + str);

    if (type == 'Update') {
        ref.updateRequest = req;
    }

}




// posts a new message to the server
// (the client wont show those changes until acknowledged from the server
WanwanClient.prototype.Post = function(message) {

    
    // form basic message
    var out = [];
    out.push("WANWANPOST");
    out.push(this.userName);
    out.push(encodeURIComponent(message));
    out.push(this.channelName);


    var str = this.io.Hexify(out);
    this.SendRequest(str, 'Post');


    return true;
    
}



WanwanClient.prototype.RequestUpdate = function() {
    var out = [];
    out.push("WANWANUPDT");
    out.push(this.channelName);
    out.push(this.index.toString());
 
    var str = this.io.Hexify(out);
    this.SendRequest(str, 'Update');   

}








WanwanClient.prototype.CheckServer = function() {


    if (!this.messages.length) return;
    for(var i = 0; i < this.messages.length; ++i) {
        if (this.messages[i].length == 0) continue;
        var packet = this.io.Dehexify(this.messages[i]);

        switch(packet[0]) {

          case "WANWANMSG":
            if (packet.length != 5) continue;
            if (this.index >= parseInt(packet[4])) continue;
            this.onWANWANMSG(
                packet[1],  // user
                decodeURIComponent(packet[2]),  // message
                packet[3]  // color
            );
            this.index = parseInt(packet[4]);

            break;

          case "WANWANOKAY":
            if (this.initialized) continue; // Pretty fishy if you ask me

            // add timeout to get updates
            var ref = this;
            setInterval(function(){
                ref.RequestUpdate();
            }, ref.updateCycleTime);
            ref.RequestUpdate();

            this.initialized = true;
            this.onWANWANOKAY();
            break;


          case "WANWANDENY":
            if (this.initialized) continue; // also pretty fishy
            console.log("Wanwan: Client version isn't supported.");
            this.onWANWANDENY();
            break;

          default:;

        }      

    }
    this.onServerResponse();
    this.messages = [];
};







