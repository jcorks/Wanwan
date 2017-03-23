#include <string.h>
#include "wanwan_client.h"
#include "wanwan_server.h"
#include "wanwan_response.h"
#include <time.h>
#include <stdlib.h>





int main(int argc, char **argv) {

    wanwan_Client * client = wanwan_client_create("TestUser", "#F0F", "127.0.0.1");
    wanwan_Server * server = wanwan_server_create();

    srand(time(NULL));
    int i = 0;
    for(; i < (rand()+1) % 10; ++i) 
        wanwan_response_push(wanwan_Response_NewMessage, client, server);

    wanwan_response_send();
    return 0;
}

