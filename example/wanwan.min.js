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
Wanwan.Init = function(canvasElementID, serverCoreURL){}



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



// an option function to set that will run when a new message is about
// to be registered. 
Wanwan.onpost = function(user, messsage, color, animationName){return true;}





// Canvas-related functions and properties


// Sets the font to use for the canvas text rendering
Wanwan.Canvas.Font = "monospace";

// Sets the font size to use for all text on the canvas
Wanwan.Canvas.FontSize = "13pt";

// Sets the scroll amoutn of the canvas
Wanwan.Canvas.VerticalScroll = 0;

// Sets the reserved space on the canvas for drawing usernames
Wanwan.Canvas.ReservedSpaceForNames = 140;



// Forces a full redraw of the canvas. This is usually only needed for resize events
// of the canvas.
Wanwan.Canvas.FullUpdate = function(){}

// usually done for you, but maybe be needed for special situations
// and external events. A "soft update" redraws the canvas' framebuffer.
// This is far quicker than a full update 
Wanwan.Canvas.SoftUpdate = function(){}






////////////////////////////////////
////////////////////////////////////






























Wanwan.Init = function(canvasID, serverCGIURL) {
    Wanwan.Canvas.Element = document.getElementById(canvasID);
    Wanwan.Canvas.Context = Wanwan.Canvas.Element.getContext("2d");
    Wanwan.Server.URL = serverCGIURL;
    Wanwan.Name("Potato");
    Wanwan.Channel("Lobby");

    setInterval(Wanwan.Client.RequestUpdate, 8500);
    Wanwan.Client.RequestUpdate();

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

Wanwan.Post = function(message) {
    Wanwan.Client.Post(message);
}


Wanwan.Canvas.SoftUpdate = function() {
    if (Wanwan.Canvas.Context == null) return;
    Wanwan.Canvas.Update();
}

Wanwan.Canvas.FullUpdate = function() {
    if (Wanwan.Canvas.Context == null) return;
    Wanwan.Canvas.UpdateFramebuffer();
}





/////////////////// CANVAS///////////////////////

Wanwan.Canvas.Text = [];
Wanwan.Canvas.Animation = {};
Wanwan.Canvas.Animation.Enter = [];
Wanwan.Canvas.Properties = {};
Wanwan.Canvas.Offscreen = document.createElement('canvas');




// The default text enter animation. should return true when 
// the animation is finished.
Wanwan.Canvas.Animation.Enter["default"] = function(text, context) {    
    return true;
}











// adds additional text to the main canvas area
Wanwan.Canvas.AddMessage = function(speaker, content, color, enterAnimationName) {
    if (Wanwan.Canvas.VerticalScroll >= Wanwan.Canvas.Text.length - Wanwan.Canvas.ViewMessageCount)
        Wanwan.Canvas.VerticalScroll++;

    var text = {};
    text.speaker        = speaker;
    text.content        = content;
    text.color          = color;
    text.onEnter        = Wanwan.Canvas.Animation.Enter[enterAnimationName];
    text.enterFinished  = false;
    text.persist        = {};

    if (text.onEnter == null) 
        text.onEnter = Wanwan.Canvas.Animation.Enter["default"];
    Wanwan.Canvas.Text.push(text);


}






// the main update look just draws all the strings we know
// in the way they're requested to be drawn
Wanwan.Canvas.UpdateFramebuffer = function() {


    var needsUpdate = false;
    var context = Wanwan.Canvas.Offscreen.getContext('2d'); //Context;


    Wanwan.Canvas.Offscreen.height = Wanwan.Canvas.Element.height;
    Wanwan.Canvas.Offscreen.width = Wanwan.Canvas.Element.width;



    var font = "" + Wanwan.Canvas.FontSize + " " + Wanwan.Canvas.Font;
    if (!Wanwan.Canvas.Properties.FontWidth) {
        Wanwan.Canvas.Properties.FontWidth = context.measureText('M').width;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    Wanwan.Canvas.ViewMessageCount = Math.floor(Wanwan.Canvas.Offscreen.height / (parseInt(Wanwan.Canvas.FontSize)*1.5))-1;


    // clip scroll amount
    if (Wanwan.Canvas.VerticalScroll > Wanwan.Canvas.Text.length - Wanwan.Canvas.ViewMessageCount) {
        Wanwan.Canvas.VerticalScroll = Wanwan.Canvas.Text.length - Wanwan.Canvas.ViewMessageCount;
    }
    if (Wanwan.Canvas.VerticalScroll < 0)
        Wanwan.Canvas.VerticalScroll = 0;

    context.clearRect(0, 0, Wanwan.Canvas.Offscreen.width, Wanwan.Canvas.Offscreen.height);
    for(var i = 0; i < Wanwan.Canvas.ViewMessageCount && i < Wanwan.Canvas.Text.length; ++i) {
        
        // always draw the speaker normally with the color request
        if (Wanwan.Canvas.Text.length > Wanwan.Canvas.ViewMessageCount)
            var text = Wanwan.Canvas.Text[i + Wanwan.Canvas.VerticalScroll];
        else 
            var text = Wanwan.Canvas.Text[i];



        context.translate(0, Math.floor(parseInt(Wanwan.Canvas.FontSize)*1.5));


        context.font = font;
        context.textAlign = "left";
        context.fillStyle = text.color;

        // clip the name area
        context.save();
        context.rect(0, -Wanwan.Canvas.Offscreen.height, Wanwan.Canvas.ReservedSpaceForNames, Wanwan.Canvas.Offscreen.height*2);
        context.clip();
        context.fillText(text.speaker + ": ", 0, 0);
        context.restore();
        context.translate(Wanwan.Canvas.ReservedSpaceForNames+6, 0);


        // draw message content
        if (!text.enterFinished) {
            text.enterFinished = text.onEnter(text, context)
            needsUpdate = true;
        } else {
            context.fillColor = text.color;
            context.fillText(text.content, 0, 0);
        }

        
        context.translate(-Wanwan.Canvas.ReservedSpaceForNames-6, 0);
    }
    if (needsUpdate && Wanwan.Canvas.UpdateID == null) {
        Wanwan.Canvas.UpdateID = setTimeout(function(){
            requestAnimationFrame(Wanwan.Canvas.UpdateFramebuffer);
            Wanwan.Canvas.UpdateID = null;
        }, 15);
    }

    Wanwan.Canvas.Update();
}


Wanwan.Canvas.Update = function() {
    Wanwan.Canvas.Context.clearRect(0, 0, Wanwan.Canvas.Element.width, Wanwan.Canvas.Element.height);
    Wanwan.Canvas.Context.drawImage(Wanwan.Canvas.Offscreen, 
        0, 0, Wanwan.Canvas.Offscreen.width, Wanwan.Canvas.Offscreen.height, 
        0, 0, Wanwan.Canvas.Element.width, Wanwan.Canvas.Element.height);
}




Wanwan.Canvas.ClearText = function() {
    Wanwan.Canvas.Text = [];
    Wanwan.Client.index = 0;
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



    /*
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
    */
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
            Wanwan.Canvas.AddMessage(
                packet[1], packet[2],
                packet[3],
                Wanwan.Server.Messages.length > 8 ? "Default" : packet[4]
            );
            Wanwan.Client.index = parseInt(packet[5]);

            break;
          default:;
        }      

    }
    requestAnimationFrame(Wanwan.Canvas.UpdateFramebuffer);
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



////////////// ANIMATIONS /////////////////////

////  active text animations 
////
//// Some built-in active animations



// Applies a sinasoid to the text
Wanwan.Canvas.Animation.Enter["Core.Wavey"] = function(text, context) {
    if (text.persist.counter == null) {
        text.persist.counter = 0;
        text.persist.factor = 1.0;

        text.persist.locTable = [];
        text.persist.locTable.push(0);
        for(var i = 1; i < text.content.length; ++i) {
            text.persist.locTable.push(
                context.measureText(text.content.substring(0, i)).width
            );
        }
        text.persist.timeoutID = null;

    }
    context.fillColor = text.color;
    var localCount = text.persist.counter;
    var sub;
    var iter = 0;
    for(var i = 0; i < text.content.length; ++i) {
        sub = text.content.substring(i, i+1);
        context.fillText(sub, text.persist.locTable[i], Math.floor(text.persist.factor*Math.sin(localCount/7) * 8));
        localCount += 5;
    }
 
    if (text.persist.timeoutID == null)    
        text.persist.timeoutID = setTimeout(function(){
            text.persist.factor *= 0.87; text.persist.counter += 4;
            text.persist.timeoutID = null;
        }, 15);
    return text.persist.factor < 0.006;
}




// emulates live speech by showing one character at a time and waiting
// longer on punctuation characters... "OPEN YOUR EYES" style
Wanwan.Canvas.Animation.Enter["Core.Speech"] = function(text, context) {
    if (text.persist.index == null) {
        text.persist.index = 0;
        text.persist.wait = 0;
        text.persist.updateID = null;
        text.persist.fn = function(){text.persist.index++; text.persist.updateID = null;};

    }
    
    context.fillColor = text.color;
    context.fillText(text.content.substring(0, text.persist.index) + "\u25A1", 0, 0);


    if (text.persist.updateID == null) {
        var sub = text.content.substring(text.persist.index, text.persist.index+1);
        if (sub == '.' ||
            sub == '?' ||
            sub == '!') {

            text.persist.updateID = setTimeout(text.persist.fn, 160);
        } else if (sub == ',') {
            text.persist.updateID = setTimeout(text.persist.fn, 70);
        } else {
            text.persist.updateID = setTimeout(text.persist.fn, 10 + (Math.random() > .9 ? 80 : 0));
        }
    }
    return (text.persist.index >= text.content.length);
}




Wanwan.Canvas.Animation.Enter["Core.Shock"] = function(text, context) {
    if (text.persist.factor == null) {
        text.persist.factor = 1.0;
        text.persist.locTable = [];
        text.persist.locTable.push(0);
        for(var i = 1; i < text.content.length; ++i) {
            text.persist.locTable.push(
                context.measureText(text.content.substring(0, i)).width
            );
        }
        text.persist.timeoutID = null;
    }
    context.fillColor = text.color;

    var sub;
    var iter = 0;
    for(var i = 0; i < text.content.length; ++i) {
        sub = text.content.substring(i, i+1);
        context.fillText(sub, 
            text.persist.locTable[i] + (Math.random()-0.5)*10*text.persist.factor, 
            + (Math.random()-0.5)*10*text.persist.factor
        );
    }
 
    if (text.persist.timeoutID == null)    
        text.persist.timeoutID = setTimeout(function(){
            text.persist.factor *= 0.95;
            text.persist.timeoutID = null;
        }, 15);

    return text.persist.factor < 0.006;
}






