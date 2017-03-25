#ifndef H_WANWAN_RESPONSE_INCLUDED
#define H_WANWAN_RESPONSE_INCLUDED

#include "wanwan_client.h"
#include "wanwan_server.h"


// Notes:
//
// Try not to send server information; let the server determine 
// if the client is compatible

typedef enum {
    wanwan_Response_AcceptClient,
    wanwan_Response_DenyClient, 
    wanwan_Response_SendSystemMessage, // usues reserved color / animation
    wanwan_Response_RoomList,
    wanwan_Response_Error, // request failed, let the user know.

} wanwan_ResponseType;


// adds a raw string to be sent to the client
void wanwan_response_push_compiled_message(const wanwan_String *);
void wanwan_response_send();

#endif
