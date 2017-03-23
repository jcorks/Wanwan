#ifndef H_WANWAN_RESPONSE_INCLUDED
#define H_WANWAN_RESPONSE_INCLUDED

#include "wanwan_client.h"
#include "wanwan_server.h"


typedef enum {
    wanwna_Response_Info,
    wanwan_Response_NewMessage

} wanwan_ResponseType;


void wanwan_response_push(wanwan_ResponseType, wanwan_Client *, wanwan_Server *);
void wanwan_response_send();

#endif
