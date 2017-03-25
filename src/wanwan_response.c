#include "wanwan_response.h"

#include <stdlib.h>
#include <stdio.h>



/* formatting rules

    SendMessage:
        0WANWANMSG00[username]00[message]00[colorstring]00[animation]00[message index integer]0



*/





static wanwan_String * output = NULL;


// prepares the response
static void general_response_init() {
    if (!output)
        output = wanwan_string_create("");
    
    wanwan_string_concatenate_cstr(output, "Content-type: text/javascript\n\n\n");
}




static void general_response_push(wanwan_String ** content, uint32_t elements) {
    if (!output)
        general_response_init();

    wanwan_String * hexContent = wanwan_string_hexify(content, elements);
    wanwan_string_concatenate_format(output,
        "Wanwan.Server.Messages.push('%s')\n", wanwan_string_get_cstr(hexContent)
    );
    wanwan_string_destroy(hexContent);
}



void wanwan_response_push(wanwan_ResponseType type, wanwan_Client * c, wanwan_Server * s) {

    /*
    wanwan_String * message[6];
    char * ask = getenv("QUERY_STRING");

    message[0] = wanwan_string_create("WANWANMSG");
    message[1] = wanwan_string_create("UserName");
    //message[2] = wanwan_string_create("Uhhhh is this working?? :(");
    message[2] = wanwan_string_create(ask ? ask : "(null)");
    message[3] = wanwan_string_create("#CCC");
    message[4] = wanwan_string_create("Core.Speech");
    message[5] = wanwan_string_create("10");

    general_response_push(message, 6);

    wanwan_string_destroy(message[0]);
    wanwan_string_destroy(message[1]);
    wanwan_string_destroy(message[2]);
    wanwan_string_destroy(message[3]);
    wanwan_string_destroy(message[4]);
    wanwan_string_destroy(message[5]);
    */

    // debugging
}


void wanwan_response_send() {
    const char * outcstr = wanwan_string_get_cstr(output);
    printf(outcstr);
    wanwan_string_destroy(output);
    output = NULL;   
}
