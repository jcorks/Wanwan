#include "wanwan_client.h"

#include <stdlib.h>
struct wanwan_Client {
    wanwan_String * name;
    wanwan_String * colorString;
    wanwan_String * ip;
};


wanwan_Client * wanwan_client_create(
    const char * name, 
    const char * colorString, 
    const char * ip) {


    wanwan_Client * w = calloc(1, sizeof(wanwan_Client));
    w->name        = wanwan_string_create(name);
    w->colorString = wanwan_string_create(colorString);
    w->ip          = wanwan_string_create(ip);

    return w;
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

