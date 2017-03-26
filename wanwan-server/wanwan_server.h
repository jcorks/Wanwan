#ifndef H_WANWAN_SERVER_INCLUDED
#define H_WANWAN_SERVER_INCLUDED

#include "wanwan_string.h"

typedef struct wanwan_Server wanwan_Server;


wanwan_Server * wanwan_server_create();

int wanwan_server_get_minor_version(const wanwan_Server *);
int wanwan_server_get_major_version(const wanwan_Server *);
void wanwan_server_get_channel_list(const wanwan_Server *, wanwan_String *** channel, uint64_t * count);


#endif
