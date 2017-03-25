#include "wanwan_client.h"

#include <stdlib.h>
#include <string.h>

#define REQUEST_POST "WANWANPOST"



struct wanwan_Client {
    wanwan_String * name;
    wanwan_String * colorString;
    wanwan_String * ip;
    wanwan_String * message;
    wanwan_String * animation;
    wanwan_ClientRequest request;
};



wanwan_Client * wanwan_client_create(
    const char * query,
    const char * ip) {


    uint32_t i;
    wanwan_Client * c = calloc(1, sizeof(wanwan_Client));
    c->ip          = wanwan_string_create(ip);
    c->request     = wanwan_Request_Invalid;

    // debugging only.    
    if (!wanwan_string_length(c->ip))
        wanwan_string_set(c->ip, "255.255.255.255");
        


    wanwan_String ** input = NULL;
    uint32_t length = 0;
    wanwan_String * queryStr = wanwan_string_create(query);
    wanwan_string_dehexify(queryStr, &input, &length);


    if (length == 0) goto L_FAIL;
    char * name = wanwan_string_get_cstr(input[0]);
    

    // PostMessage format:
    //  
    //  0 WANWANPOST 0 UserName 0 MessageText 0 Animation Name 0
    //
    if (!strcmp(name, REQUEST_POST)) {
        if (length != 4) goto L_FAIL;
        c->request   = wanwan_Request_PostMessage;      
        c->name      = wanwan_string_copy(input[1]);
        c->message   = wanwan_string_copy(input[2]);
        c->animation = wanwan_string_copy(input[3]);
    }





  L_FAIL:
    if (name) free(name);
    for(i = 0; i < length; ++i) {
        wanwan_string_destroy(input[i]);
    }    

    return c;
}


const wanwan_String * wanwan_client_get_name(const wanwan_Client * c) {
    return c->name;
}

const wanwan_String * wanwan_client_get_color(const wanwan_Client * c) {
    return c->colorString;
}

const wanwan_String * wanwan_client_get_ip(const wanwan_Client * c) {
    return c->ip;
}

const wanwan_String * wanwan_client_get_message(const wanwan_Client * c) {
    return c->message;
}

wanwan_ClientRequest wanwan_client_get_request(const wanwan_Client * c) {
    return c->request;
}   

