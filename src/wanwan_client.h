#ifndef H_WANWAN_CLIENT_INCLUDED
#define H_WANWAN_CLIENT_INCLUDED

#include "wanwan_string.h"

typedef struct wanwan_Client wanwan_Client;

wanwan_Client * wanwan_client_create(const char * name, const char * colorString, const char * IP);
wanwan_Client * wanwan_client_create_from_data(const char * hexData);

const wanwan_String * wanwan_client_get_name(const wanwan_Client *);
const wanwan_String * wanwan_client_get_color(const wanwan_Client *);
const wanwan_String * wanwan_client_get_ip(const wanwan_Client *);


#endif
