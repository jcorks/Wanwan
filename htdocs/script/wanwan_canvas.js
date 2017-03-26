Wanwan.Canvas = {};
Wanwan.Canvas.Text = [];
Wanwan.Canvas.Animation = {};
Wanwan.Canvas.Animation.Enter = [];
Wanwan.Canvas.Properties = {};
Wanwan.Canvas.Properties.FontHeight = 13;
Wanwan.Canvas.Offscreen = document.createElement('canvas');




// The default text enter animation. should return true when 
// the animation is finished.
Wanwan.Canvas.Animation.Enter["default"] = function(text, context) {    
    return true;
}











// adds additional text to the main canvas area
Wanwan.Canvas.AddMessage = function(speaker, content, color, enterAnimationName) {
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

    requestAnimationFrame(Wanwan.Canvas.UpdateFramebuffer);
}






// the main update look just draws all the strings we know
// in the way they're requested to be drawn
Wanwan.Canvas.UpdateFramebuffer = function() {


    var needsUpdate = false;
    var context = Wanwan.Canvas.Offscreen.getContext('2d'); //Context;


    Wanwan.Canvas.Offscreen.height = Wanwan.Canvas.Element.height;
    Wanwan.Canvas.Offscreen.width = Wanwan.Canvas.Element.width;



    var font = "" + Wanwan.Canvas.Properties.FontHeight + "pt wanwan_font_main";
    if (!Wanwan.Canvas.Properties.FontWidth) {
        Wanwan.Canvas.Properties.FontWidth = context.measureText('M').width;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    var messageCount = Math.floor(Wanwan.Canvas.Offscreen.height / (Wanwan.Canvas.Properties.FontHeight*1.5));


    context.clearRect(0, 0, Wanwan.Canvas.Offscreen.width, Wanwan.Canvas.Offscreen.height);
    for(var i = 0; i < messageCount && i < Wanwan.Canvas.Text.length; ++i) {
        
        // always draw the speaker normally with the color request
        if (Wanwan.Canvas.Text.length > messageCount)
            var text = Wanwan.Canvas.Text[i + Wanwan.Canvas.Text.length - messageCount];
        else 
            var text = Wanwan.Canvas.Text[i];



        context.translate(0, Math.floor(Wanwan.Canvas.Properties.FontHeight*1.5));


        context.font = font;
        context.textAlign = "left";
        context.fillStyle = text.color;
        context.fillText(text.speaker + ": ", 0, 0);
        context.translate(Wanwan.Canvas.Properties.FontWidth*12, 0);


        // TODO: doesn't seem to terminate properly yet!
        if (!text.enterFinished) {
            text.enterFinished = text.onEnter(text, context)
            needsUpdate = true;
        } else {
            context.fillColor = text.color;
            context.fillText(text.content, 0, 0);
        }

        
        context.translate(-Wanwan.Canvas.Properties.FontWidth*12, 0);
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







