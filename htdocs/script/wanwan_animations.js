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
        context.fillText(sub, iter, text.persist.factor*Math.sin(localCount/10.0) * 5);
        iter += Wanwan.Canvas.Properties.FontWidth;
        localCount += 5;
    }
    text.persist.counter += 1.8;
    text.persist.factor *= 0.97;
    return text.persist.factor < 1e-6;
}




// emulates live speech by showing one character at a time and waiting
// longer on punctuation characters
Wanwan.Canvas.Animation.Enter["Core.Speech"] = function(text, context) {
    if (text.persist.index == null) {
        text.persist.index = 0;
        text.persist.wait = 0;
    }
    
    context.fillColor = text.color;
    context.fillText(text.content.substring(0, text.persist.index), 0, 0);


    text.persist.wait +=1;
    if (text.persist.wait >= 1) {
        var sub = text.content.substring(text.persist.index, text.persist.index+1);
        if (sub == '.' ||
            sub == '?' ||
            sub == '!') {
            text.persist.wait = -6;
        } else if (sub == ',') {
            text.persist.wait = -3;
        } else {
            text.persist.wait = 0;
        }
        text.persist.index++;
    }
    return (text.persist.index == text.content.length);
}







