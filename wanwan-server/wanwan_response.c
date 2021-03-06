#include "wanwan_response.h"

#include <stdlib.h>
#include <stdio.h>








static wanwan_String * output = NULL;


// prepares the response
static void general_response_init() {
    if (!output)
        output = wanwan_string_create("");
    
    // add the plaintext flag and the CORS header

    wanwan_string_concatenate_cstr(output, "Content-type: text/plain\n");
    wanwan_string_concatenate_cstr(output, "Access-Control-Allow-Origin: *\n\n");
}




void wanwan_response_push_compiled_message(const wanwan_String * hexContent) {
    if (!output)
        general_response_init();

    wanwan_string_concatenate_format(output,
        "%s\n", wanwan_string_get_cstr(hexContent)
    );
}




void wanwan_response_send() {
    if (!output)
        general_response_init();

    const char * outcstr = wanwan_string_get_cstr(output);
    printf(outcstr);
    wanwan_string_destroy(output);
    output = NULL;   
}
