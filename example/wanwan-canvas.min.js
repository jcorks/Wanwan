/// Canvas-related functions and properties

Wanwan.Canvas.ElementID = "";

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
////////////////////////////////////
Wanwan.Bind("initialize", function() {
    Wanwan.Canvas.Element = document.getElementById(Wanwan.Canvas.ElementID);
    Wanwan.Canvas.Context = Wanwan.Canvas.Element.getContext("2d");
    return true;
});



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

    return true;
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






