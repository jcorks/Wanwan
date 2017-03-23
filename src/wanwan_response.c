#include "wanwan_response.h"

#include <stdlib.h>
#include <stdio.h>



/* formatting rules

    NewMessage:

        0NewMessage0[username]0[message]0[colorstring]0[animation]00



*/





static wanwan_String * output = NULL;


// prepares the response
static void general_response_init() {
    if (!output)
        output = wanwan_string_create("");
    
    wanwan_string_concatenate_cstr(output, "Content-type: text/javascript\n\n\n");
}




static void general_response_push(wanwan_String * content) {
    if (!output)
        general_response_init();

    wanwan_String * hexContent = wanwan_string_hexify(&content, 1);
    char * hexContentStr = wanwan_string_get_cstr(hexContent);
    wanwan_string_concatenate_format(output,
        "Wanwan.Server.Messages.push('%s')\n", hexContentStr
    );
    wanwan_string_destroy(hexContent);
    free(hexContentStr);
}



void wanwan_response_push(wanwan_ResponseType type, wanwan_Client * c, wanwan_Server * s) {
    wanwan_String * message = wanwan_string_create("");


    wanwan_string_concatenate_format(message, "Hello!!! %d", rand());
    general_response_push(message);
    wanwan_string_destroy(message);
    // debugging
}


void wanwan_response_send() {
    char * outcstr = wanwan_string_get_cstr(output);
    printf(outcstr);
    free(outcstr); 
    wanwan_string_destroy(output);
    output = NULL;   
}
