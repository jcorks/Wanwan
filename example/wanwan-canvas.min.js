/// Canvas-related functions and properties
Wanwan.Canvas = {};


// The canvas element references that should be used to update 
//
Wanwan.Canvas.Element = null;


// Sets the animation to use by default when showing a cnavas animation 
//
Wanwan.Canvas.DefaultAnimation = "Core.Speech";

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



// Manually shows a message post on the canvas 
// 
Wanwan.Canvas.PostMessage = function(username, message, color){}


// Clears all shown messages from the canvas.
Wanwan.Canvas.ClearText = function(){}








////////////////////////////////////
////////////////////////////////////
////////////////////////////////////



Wanwan.Canvas.SoftUpdate = function() {
    if (Wanwan.Canvas.Element == null) return;
    Wanwan.Canvas.Update();
}

Wanwan.Canvas.FullUpdate = function() {
    Wanwan.Canvas.UpdateFramebuffer();
}







/////////////////// CANVAS///////////////////////

Wanwan.Canvas.Text = [];
Wanwan.Canvas.Animation = {};
Wanwan.Canvas.Animation.Enter = [];
Wanwan.Canvas.Properties = {};
Wanwan.Canvas.Properties.wrapIndex = 1;
Wanwan.Canvas.Properties.messagesToProcess = 0;
Wanwan.Canvas.Offscreen = document.createElement('canvas');
Wanwan.Canvas.yToText = [];


Wanwan.Canvas.ClearText = function() {
    Wanwan.Canvas.Text = [];
    Wanwan.Canvas.UpdateY(Wanwan.Canvas.Offscreen.getContext('2d'));
    Wanwan.Client.index = 0;
}

// The default text enter animation. should return true when 
// the animation is finished.
Wanwan.Canvas.Animation.Enter["default"] = function(text, context) {    
    return true;
}





Wanwan.Canvas.UpdateMessageMetrics = function(context, text, textIndex) {
    var predecessor = textIndex == 0 ? null :  Wanwan.Canvas.Text[textIndex-1];
    text.y              = predecessor ? predecessor.y + predecessor.contentWrapped.length : 0;
    text.contentWrapped = Wanwan.Canvas.WrapSplitText(
        context, 
        text.content, 
        Wanwan.Canvas.Offscreen.width - Wanwan.Canvas.ReservedSpaceForNames
    );
    text.wrapIndex = Wanwan.Canvas.Properties.wrapIndex;
    for(var n = 0; n < text.contentWrapped.length; ++n) {
        Wanwan.Canvas.yToText.push(text);
    }
    Wanwan.Canvas.Properties.Span = text.y + text.contentWrapped.length;
}





// adds additional text to the main canvas area
Wanwan.Canvas.PostMessage = function(speaker, message, color) {


    var anime = Wanwan.Canvas.DefaultAnimation;
    if (message.length >= 4 &&
        message[0] == '[' && 
        message[2] == ']') {
        switch(message[1]) {
          case '~': anime = "Core.Wavey"; break;
          case '!': anime = "Core.Shock"; break;
        }

        message = message.substring(3, message.length);
    }

    var context = Wanwan.Canvas.Offscreen.getContext('2d'); //Context;

    var text = {};
    text.speaker        = speaker;
    text.content        = message;
    text.color          = color;
    text.onEnter        = Wanwan.Canvas.Animation.Enter[anime];
    text.enterFinished  = false;
    text.persist        = {};



    if (text.onEnter == null) 
        text.onEnter = Wanwan.Canvas.Animation.Enter["default"];
    
    var pushToEnd = (Wanwan.Canvas.VerticalScroll >= Wanwan.Canvas.Properties.Span - Wanwan.Canvas.ViewMessageCount)

    Wanwan.Canvas.Text.push(text);
    if (context) {
        Wanwan.Canvas.UpdateMessageMetrics(
            context,
            text,
            Wanwan.Canvas.Text.length-1
        );
    }

    if (pushToEnd) Wanwan.Canvas.VerticalScroll+= text.contentWrapped ? text.contentWrapped.length : 1;

    Wanwan.Canvas.Properties.messagesToProcess++;

    return true;
}



// returns an array of string lines where 
// if drawn with the given context, no line exceeds wrapWidth
Wanwan.Canvas.WrapSplitText = function(context, text, wrapWidth) {
    var out = [];
    var line = "";
    for(var i = 0; i < text.length; ++i) {
        if (context.measureText(line+text[i]).width >= wrapWidth) {
            out.push(line);
            line = "";
        }
        line += text[i];
    }
    out.push(line);
    return out;
}

Wanwan.Canvas.UpdateY = function(context) {
    context.font = "" + Wanwan.Canvas.FontSize + " " + Wanwan.Canvas.Font;;
    context.textAlign = "left";
    Wanwan.Canvas.yToText = [];
    
    var y = 0;
    for(var i = 0; i < Wanwan.Canvas.Text.length; ++i) {    
        Wanwan.Canvas.UpdateMessageMetrics(context, Wanwan.Canvas.Text[i], i);
    }
    Wanwan.Canvas.Properties.Span = y;
}
Wanwan.Canvas.DrawView = function(context, viewBaseline, viewHeight) {
    // first, get text objects we need to draw
    var needsUpdate = false;
    var objs = [];
    for(var y = viewBaseline; y < viewBaseline+viewHeight && y < Wanwan.Canvas.yToText.length; ++y) {
        var text = Wanwan.Canvas.yToText[y];
        if (!objs.length ||
            !(objs[objs.length-1] === text)) {

            
            objs.push(text);
        }
    }

    if (Wanwan.Canvas.Properties.messagesToProcess > Wanwan.Canvas.ViewMessageCount) {
        for(var y = 0; y < Wanwan.Canvas.Text.length; ++y)
            Wanwan.Canvas.Text[y].enterFinished = true;
    }

    for(var i = 0; i < objs.length; ++i) {
        needsUpdate+=Wanwan.Canvas.DrawMessage(context, objs[i], viewBaseline);
    }
    Wanwan.Canvas.Properties.messagesToProcess = 0;
    return needsUpdate!=0;
}


Wanwan.Canvas.DrawMessage = function(context, text, viewBaseline) {
    var needsUpdate = false;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(0, (-viewBaseline + text.y+1)*Wanwan.Canvas.Properties.FontHeight);



    context.fillStyle = text.color;

    // clip the name area
    context.save();
    context.beginPath();
    context.rect(0, -Wanwan.Canvas.Offscreen.height, Wanwan.Canvas.ReservedSpaceForNames, Wanwan.Canvas.Offscreen.height*2);
    context.clip();
    context.fillText(text.speaker + ": ", 0, 0);
    context.restore();
    context.translate(Wanwan.Canvas.ReservedSpaceForNames+6, 0);


    // draw message content, preserving space for the wrapped text
    if (!text.enterFinished) {
        text.enterFinished = text.onEnter(text, context)
        needsUpdate = true;
    } else {
        text.enterFinished = Wanwan.Canvas.Animation.Enter["none"](text, context);
    }
    return needsUpdate;
}




// the main update look just draws all the strings we know
// in the way they're requested to be drawn
Wanwan.Canvas.UpdateFramebuffer = function() {


    var needsUpdate = false;
    var context = Wanwan.Canvas.Offscreen.getContext('2d'); //Context;


    if (Wanwan.Canvas.Offscreen.height != Wanwan.Canvas.Element.height ||
        Wanwan.Canvas.Offscreen.width != Wanwan.Canvas.Element.width ||
        Wanwan.Canvas.Offscreen.Font != Wanwan.Canvas.Font ||
        Wanwan.Canvas.Offscreen.FontSize != Wanwan.Canvas.FontSize) {


        Wanwan.Canvas.Offscreen.height = Wanwan.Canvas.Element.height;
        Wanwan.Canvas.Offscreen.width = Wanwan.Canvas.Element.width;
        Wanwan.Canvas.Offscreen.Font = Wanwan.Canvas.Font;
        Wanwan.Canvas.Offscreen.FontSize = Wanwan.Canvas.FontSize;
        Wanwan.Canvas.Properties.FontHeight = Math.floor(parseInt(Wanwan.Canvas.FontSize)*1.5);
        Wanwan.Canvas.Properties.FontWidth = context.measureText('M').width;

        Wanwan.Canvas.UpdateY(context);
        Wanwan.Canvas.ViewMessageCount = Math.floor(Wanwan.Canvas.Offscreen.height / (parseInt(Wanwan.Canvas.FontSize)*1.5))-1;

    }







    context.setTransform(1, 0, 0, 1, 0, 0);


    // clip scroll amount
    if (Wanwan.Canvas.VerticalScroll > Wanwan.Canvas.Properties.Span - Wanwan.Canvas.ViewMessageCount) {
        Wanwan.Canvas.VerticalScroll = Wanwan.Canvas.Properties.Span - Wanwan.Canvas.ViewMessageCount;
    }
    if (Wanwan.Canvas.VerticalScroll < 0)
        Wanwan.Canvas.VerticalScroll = 0;



    context.clearRect(0, 0, Wanwan.Canvas.Offscreen.width, Wanwan.Canvas.Offscreen.height);
    needsUpdate = Wanwan.Canvas.DrawView(
        context, 
        Wanwan.Canvas.VerticalScroll,
        Wanwan.Canvas.ViewMessageCount 
    );




    if (needsUpdate && Wanwan.Canvas.UpdateID == null) {
        Wanwan.Canvas.UpdateID = setTimeout(function(){
            requestAnimationFrame(Wanwan.Canvas.UpdateFramebuffer);
            Wanwan.Canvas.UpdateID = null;
        }, 15);
    }
    
    Wanwan.Canvas.Update();
}


Wanwan.Canvas.Update = function() {
    Wanwan.Canvas.Context = Wanwan.Canvas.Element.getContext("2d");
    Wanwan.Canvas.Context.clearRect(0, 0, Wanwan.Canvas.Element.width, Wanwan.Canvas.Element.height);
    Wanwan.Canvas.Context.drawImage(Wanwan.Canvas.Offscreen, 
        0, 0, Wanwan.Canvas.Offscreen.width, Wanwan.Canvas.Offscreen.height, 
        0, 0, Wanwan.Canvas.Element.width, Wanwan.Canvas.Element.height);
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

Wanwan.Canvas.Animation.Enter["none"] = function(text, context) {
    context.fillColor = text.color;
    for(var i = 0; i < text.contentWrapped.length; ++i) {
        context.fillText(text.contentWrapped[i], 0, 0);
        context.translate(0, Wanwan.Canvas.Properties.FontHeight);
    }
    return true;
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
    
    
    //context.fillColor = text.color;
    //context.fillText(text.content.substring(0, text.persist.index) + "\u25A1", 0, 0);
    var usedIndex = text.persist.index;
    for(var i = 0; i < text.contentWrapped.length; ++i) {
        if (usedIndex > text.contentWrapped[i].length) {
            context.fillColor = text.color;
            context.fillText(text.contentWrapped[i], 0, 0);
            usedIndex -= text.contentWrapped[i].length;
            context.translate(0, Wanwan.Canvas.Properties.FontHeight);

        } else {
            context.fillColor = text.color;
            context.fillText(text.contentWrapped[i].substring(0, usedIndex) + "\u25A1", 0, 0);
            context.translate(0, Wanwan.Canvas.Properties.FontHeight);
            break;
        }
    }



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







Wanwan.Bind("channel-change", function(channel) {
    Wanwan.Canvas.ClearText();
    return true;
});


Wanwan.Bind("server-response", function() {
    requestAnimationFrame(Wanwan.Canvas.UpdateFramebuffer);
    return true;
});

Wanwan.Bind("server-message", Wanwan.Canvas.PostMessage);



