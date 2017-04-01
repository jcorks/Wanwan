#ifndef H_WANWAN_CHANNEL_DEFINED
#define H_WANWAN_CHANNEL_DEFINED


#include "wanwan_string.h"

typedef struct wanwan_Channel wanwan_Channel;

wanwan_Channel * wanwan_channel_create(const char * name, const char * path);

const wanwan_String * wanwan_channel_get_name(const wanwan_Channel *);
const wanwan_String * wanwan_channel_get_description(const wanwan_Channel *);

// retrieves all the messages that a client will need to show based on their 
// last saught index. Returned is the new client index that the client should look for
uint64_t              wanwan_channel_get_messages_since(const wanwan_Channel *, uint64_t clientIndex, wanwan_String *** newMessages, uint64_t * count);

// adds a message to channel storage and returns the message's index
void                  wanwan_channel_write_message(const wanwan_Channel *, 
                                                   const wanwan_String * name, 
                                                   const wanwan_String * message, 
                                                   const wanwan_String * color);

// returns whether the channel actually phsyically exists on the server.
int                   wanwan_channel_exists(const wanwan_Channel *);

// if the channel doesn't exist, this will create the files necessary to make it exist 
// else it clears all history and "refreshes" the channel
int                   wanwan_channel_initialize(const wanwan_Channel *, const char * description);



#endif
