var Wanwan = {};

Wanwan.Init = function(canvasID, serverCGIURL) {
    Wanwan.Canvas.Element = document.getElementById(canvasID);
    Wanwan.Canvas.Context = Wanwan.Canvas.Element.getContext("2d");
    Wanwan.Server.URL = serverCGIURL;

    setInterval(Wanwan.Server.Check, 300);



}




Wanwan.Input = function(event) {
    if (event.keyCode == 13) {
        
        /*
        textContent = document.getElementById("command").value; 
        document.getElementById("command").value = "";


        Wanwan.Canvas.AddText(
            "Test", textContent,
            "#FFF",
            "Core.Wavey"
        );
        */
        Wanwan.Client.Post("Test");
    }
    
}

