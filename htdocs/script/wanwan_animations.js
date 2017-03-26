////  active text animations 
////
//// Some built-in active animations



// Applies a sinasoid to the text
Wanwan.Canvas.Animation.Enter["Core.Wavey"] = function(text, context) {
    if (text.persist.counter == null) {
        text.persist.counter = 0;
        text.persist.factor = 1.0;
    }
    context.fillColor = text.color;
    var localCount = text.persist.counter;
    var sub;
    var iter = 0;
    for(var i = 0; i < text.content.length; ++i) {
        sub = text.content.substring(i, i+1);
        context.fillText(sub, Math.floor(iter), Math.floor(text.persist.factor*Math.sin(localCount/10.0) * 5));
        iter += Wanwan.Canvas.Properties.FontWidth;
        localCount += 5;
    }
    setTimeout(function(){text.persist.factor *= 0.87; text.persist.counter += 6;}, 15);
    return text.persist.factor < 0.01;
}




// emulates live speech by showing one character at a time and waiting
// longer on punctuation characters
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







