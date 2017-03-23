#ifndef H_WANWAN_SERVER_INCLUDED
#define H_WANWAN_SERVER_INCLUDED

typedef struct wanwan_Server wanwan_Server;


wanwan_Server * wanwan_server_create();

int wanwan_server_get_minor_version(const wanwan_Server *);
int wanwan_server_get_major_version(const wanwan_Server *);



#endif
