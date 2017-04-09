////// Contains helper functions to make 
////// make the examples for readable



/// Sends the message within the event box to the Wanwan server
/// when a user presses enter
SendMessage = function(event) {
    if (event.keyCode == 13) {
        
        client.Name(textContent = document.getElementById("nameEntry").value); 
        textContent = document.getElementById("command").value; 
        document.getElementById("command").value = "";

        client.Send(textContent);
    }
}




// prints the message to the canvas
// by inserting a new element that displays the user and 
// message colored with the server-requested color.
ShowMessage = function(user, message, color) {
    var element = document.getElementById("output");
    var node = document.createElement("div");
    var sub = document.createTextNode(user + ":   " + message);
    node.appendChild(sub);
    node.style = "color:" + color + ";";
    element.appendChild(node);

    // just remove earliest message if above 200
    if (element.children.length > 200) {
        element.removeChild(element.children[0]);
    }
    window.scrollBy(0, 500);
}




// Asks whether the user wants to continue. The response 
// is processed by the "onresponse" function given.
Ask = function(client, onresponse) {

    var realSendMessage = SendMessage;
    SendMessage = function(event) {
        if (event.keyCode == 13) {
            client.Name(textContent = document.getElementById("nameEntry").value); 
            textContent = document.getElementById("command").value; 
            document.getElementById("command").value = "";

            onresponse(textContent.toLowerCase());
            SendMessage = realSendMessage;

        }
    }
}


