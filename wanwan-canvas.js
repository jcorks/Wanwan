


/// Canvas-related functions and properties
function WanwanCanvas(){}

// The canvas element references that should be used to update 
//
WanwanCanvas.prototype.Element = null;


// Sets the animation to use by default when showing a cnavas animation 
//
WanwanCanvas.prototype.DefaultAnimation = "speech";

// Sets the font to use for the canvas text rendering
WanwanCanvas.prototype.Font = "monospace";

// Sets the font size to use for all text on the canvas
WanwanCanvas.prototype.FontSize = "13pt";

// Sets the scroll amoutn of the canvas
WanwanCanvas.prototype.VerticalScroll = 0;

// Sets the reserved space on the canvas for drawing usernames
WanwanCanvas.prototype.ReservedSpaceForNames = 140;



// Forces a full redraw of the canvas. This is usually only needed for resize events
// of the canvas.
WanwanCanvas.prototype.FullUpdate = function(){}

// usually done for you, but maybe be needed for special situations
// and external events. A "soft update" redraws the canvas' framebuffer.
// This is far quicker than a full update 
WanwanCanvas.prototype.SoftUpdate = function(){}



// Manually shows a message post on the canvas 
// 
WanwanCanvas.prototype.PostMessage = function(username, message, color){}


// Clears all shown messages from the canvas.
WanwanCanvas.prototype.ClearText = function(){}








////////////////////////////////////
////////////////////////////////////
////////////////////////////////////



WanwanCanvas.prototype.SoftUpdate = function() {
    if (this.Element == null) return;
    this.Update();
}

WanwanCanvas.prototype.FullUpdate = function() {
    this.UpdateFramebuffer();
}







/////////////////// CANVAS///////////////////////

function WanwanCanvas(ww) {
    var ref = this;

    ww.Bind("server-accept", function(channel) {
        ref.ClearText();
        return true;
    });


    ww.Bind("server-response", function() {
        requestAnimationFrame(function(){
            ref.UpdateFramebuffer();
        });
        return true;
    });

    ww.Bind("server-message", function(user, message, color, animationName){
        ref.PostMessage(user, message, color);
    });

    this.Offscreen = document.createElement('canvas');
    this.Properties = {};
    this.Properties.wrapIndex = 1;
    this.Properties.messagesToProcess = 0;
    this.Text = [];
    this.yToText = [];
}







WanwanCanvas.prototype.ClearText = function() {
    this.Text = [];
    this.UpdateY(this.Offscreen.getContext('2d'));
    this.index = 0;
}






WanwanCanvas.prototype.UpdateMessageMetrics = function(context, text, textIndex) {
    var predecessor = textIndex == 0 ? null :  this.Text[textIndex-1];
    text.y              = predecessor ? predecessor.y + predecessor.contentWrapped.length : 0;
    text.contentWrapped = this.WrapSplitText(
        context, 
        text.content, 
        this.Offscreen.width - this.ReservedSpaceForNames
    );
    text.wrapIndex = this.Properties.wrapIndex;
    for(var n = 0; n < text.contentWrapped.length; ++n) {
        this.yToText.push(text);
    }
    this.Properties.Span = text.y + text.contentWrapped.length;
}





// adds additional text to the main canvas area
WanwanCanvas.prototype.PostMessage = function(speaker, message, color) {


    var anime = this.DefaultAnimation;
    if (message.length >= 4 &&
        message[0] == '[' && 
        message[2] == ']') {
        switch(message[1]) {
          case '~': anime = "wavey"; break;
          case '!': anime = "shock"; break;
        }

        message = message.substring(3, message.length);
    }

    var context = this.Offscreen.getContext('2d'); //Context;

    var text = {};
    text.parent         = this;
    text.speaker        = speaker;
    text.content        = message;
    text.color          = color;
    text.onEnter        = WanwanCanvasAnimations[anime];
    text.enterFinished  = false;
    text.persist        = {};



    if (text.onEnter == null) 
        text.onEnter = WanwanCanvasAnimations["default"];
    
    var pushToEnd = (this.VerticalScroll >=this.Properties.Span - this.ViewMessageCount)

    this.Text.push(text);
    if (context) {
        this.UpdateMessageMetrics(
            context,
            text,
            this.Text.length-1
        );
    }

    if (pushToEnd) this.VerticalScroll+= text.contentWrapped ? text.contentWrapped.length : 1;

    this.Properties.messagesToProcess++;

    return true;
}



// returns an array of string lines where 
// if drawn with the given context, no line exceeds wrapWidth
WanwanCanvas.prototype.WrapSplitText = function(context, text, wrapWidth) {
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

WanwanCanvas.prototype.UpdateY = function(context) {
    context.font = "" + this.FontSize + " " + this.Font;;
    context.textAlign = "left";
    this.yToText = [];
    
    var y = 0;
    for(var i = 0; i < this.Text.length; ++i) {    
        this.UpdateMessageMetrics(context, this.Text[i], i);
    }
    this.Properties.Span = y;
}
WanwanCanvas.prototype.DrawView = function(context, viewBaseline, viewHeight) {
    // first, get text objects we need to draw
    var needsUpdate = false;
    var objs = [];
    for(var y = viewBaseline; y < viewBaseline+viewHeight && y < this.yToText.length; ++y) {
        var text = this.yToText[y];
        if (!objs.length ||
            !(objs[objs.length-1] === text)) {

            
            objs.push(text);
        }
    }

    if (this.Properties.messagesToProcess > this.ViewMessageCount) {
        for(var y = 0; y < this.Text.length; ++y)
            this.Text[y].enterFinished = true;
    }

    for(var i = 0; i < objs.length; ++i) {
        needsUpdate+=this.DrawMessage(context, objs[i], viewBaseline);
    }
    this.Properties.messagesToProcess = 0;
    return needsUpdate!=0;
}


WanwanCanvas.prototype.DrawMessage = function(context, text, viewBaseline) {
    var needsUpdate = false;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(0, (-viewBaseline + text.y+1)*this.Properties.FontHeight);



    context.fillStyle = text.color;

    // clip the name area
    context.save();
    context.beginPath();
    context.rect(0, -this.Offscreen.height, this.ReservedSpaceForNames, this.Offscreen.height*2);
    context.clip();
    context.fillText(text.speaker + ": ", 0, 0);
    context.restore();
    context.translate(this.ReservedSpaceForNames+6, 0);


    // draw message content, preserving space for the wrapped text
    if (!text.enterFinished) {
        text.enterFinished = text.onEnter(text, context)
        needsUpdate = true;
    } else {
        text.enterFinished = WanwanCanvasAnimations["none"](text, context);
    }
    return needsUpdate;
}




// the main update look just draws all the strings we know
// in the way they're requested to be drawn
WanwanCanvas.prototype.UpdateFramebuffer = function() {


    var needsUpdate = false;
    var context = this.Offscreen.getContext('2d'); //Context;


    if (this.Offscreen.height != this.Element.height ||
        this.Offscreen.width != this.Element.width ||
        this.Offscreen.Font != this.Font ||
        this.Offscreen.FontSize != this.FontSize) {


        this.Offscreen.height = this.Element.height;
        this.Offscreen.width = this.Element.width;
        this.Offscreen.Font = this.Font;
        this.Offscreen.FontSize = this.FontSize;
        this.Properties.FontHeight = Math.floor(parseInt(this.FontSize)*1.5);
        this.Properties.FontWidth = context.measureText('M').width;

        this.UpdateY(context);
        this.ViewMessageCount = Math.floor(this.Offscreen.height / (parseInt(this.FontSize)*1.5))-1;

    }







    context.setTransform(1, 0, 0, 1, 0, 0);


    // clip scroll amount
    if (this.VerticalScroll > this.Properties.Span - this.ViewMessageCount) {
        this.VerticalScroll = this.Properties.Span - this.ViewMessageCount;
    }
    if (this.VerticalScroll < 0)
        this.VerticalScroll = 0;



    context.clearRect(0, 0, this.Offscreen.width, this.Offscreen.height);
    needsUpdate = this.DrawView(
        context, 
        this.VerticalScroll,
        this.ViewMessageCount 
    );




    if (needsUpdate && this.UpdateID == null) {
        var ref = this;
        this.UpdateID = setTimeout(function(){
            requestAnimationFrame(function(){
                ref.UpdateFramebuffer();
            });
            ref.UpdateID = null;
        }, 15);
    }
    
    this.Update();
}


WanwanCanvas.prototype.Update = function() {
    this.Context = this.Element.getContext("2d");
    this.Context.clearRect(0, 0, this.Element.width, this.Element.height);
    this.Context.drawImage(this.Offscreen, 
        0, 0, this.Offscreen.width, this.Offscreen.height, 
        0, 0, this.Element.width, this.Element.height);
}



















////////////// ANIMATIONS /////////////////////

////  active text animations 
////
//// Some built-in active animations


// The default text enter animation. should return true when 
// the animation is finished.
WanwanCanvasAnimations = {};
WanwanCanvasAnimations["default"] = function(text, context) {    
    return true;
}



// Applies a sinasoid to the text
WanwanCanvasAnimations["wavey"] = function(text, context) {
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

WanwanCanvasAnimations["none"] = function(text, context) {
    context.fillColor = text.color;
    for(var i = 0; i < text.contentWrapped.length; ++i) {
        context.fillText(text.contentWrapped[i], 0, 0);
        context.translate(0, text.parent.Properties.FontHeight);
    }
    return true;
}




// emulates live speech by showing one character at a time and waiting
// longer on punctuation characters... "OPEN YOUR EYES" style
WanwanCanvasAnimations["speech"] = function(text, context) {
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
            context.translate(0, text.parent.Properties.FontHeight);

        } else {
            context.fillColor = text.color;
            context.fillText(text.contentWrapped[i].substring(0, usedIndex) + "\u25A1", 0, 0);
            context.translate(0, text.parent.Properties.FontHeight);
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




WanwanCanvasAnimations["shock"] = function(text, context) {
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






