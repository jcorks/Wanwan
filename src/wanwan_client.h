#ifndef H_WANWAN_CLIENT_INCLUDED
#define H_WANWAN_CLIENT_INCLUDED

#include "wanwan_string.h"
#include "wanwan_channel.h"

typedef struct wanwan_Client wanwan_Client;


typedef enum {
    wanwan_Request_ServerQuery, // response with either Accept / Deny. Incites checking of server compatability
    wanwan_Request_PostMessage, // response: add room message and cast to all
    wanwan_Request_RoomList,    // response: room list
    wanwan_Request_Invalid,     // the data from the client wasn't valid in some way.
} wanwan_ClientRequest;

wanwan_Client * wanwan_client_create(const char * query, const char * ip);

const wanwan_String * wanwan_client_get_name(const wanwan_Client *);
const wanwan_String * wanwan_client_get_color(const wanwan_Client *);
const wanwan_String * wanwan_client_get_ip(const wanwan_Client *);
const wanwan_String * wanwan_client_get_message(const wanwan_Client *);
const wanwan_String * wanwan_client_get_animation(const wanwan_Client *);
const wanwan_Channel * wanwan_client_get_channel(const wanwan_Client *);
wanwan_ClientRequest wanwan_client_get_request();


#endif
