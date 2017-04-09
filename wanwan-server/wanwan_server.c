#include "wanwan_server.h"

#include <stdlib.h>

struct wanwan_Server {
    int notusedyet;
};


wanwan_Server * wanwan_server_create() {
    wanwan_Server * out = calloc(sizeof(wanwan_Server), 1);
    return out;
}



int wanwan_server_get_minor_version(const wanwan_Server * s) {
    return 1;
}
int wanwan_server_get_major_version(const wanwan_Server * s) {
    return 0;
}



