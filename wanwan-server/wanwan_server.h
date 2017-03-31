#ifndef H_WANWAN_SERVER_INCLUDED
#define H_WANWAN_SERVER_INCLUDED

#include "wanwan_string.h"

typedef struct wanwan_Server wanwan_Server;


wanwan_Server * wanwan_server_create();

// Returns the minor version of the server. 
// Minor versions should ideally only contain tweaks and not affect
// the interface or query/response format.
#define wanwan_server_minor_version 1

// Returns the major version. Major versions are incompatible with 
// assets from different major versions. 
#define wanwan_server_major_version 0



void wanwan_server_get_channel_list(const wanwan_Server *, wanwan_String *** channel, uint64_t * count);


#endif
