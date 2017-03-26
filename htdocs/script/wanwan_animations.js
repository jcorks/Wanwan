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
            text.persist.updateID = setTimeout(text.persist.fn, 20 + (Math.random() > .9 ? 90 : 0));
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





