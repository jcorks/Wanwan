#include <string.h>
#include "wanwan_client.h"
#include "wanwan_server.h"
#include "wanwan_response.h"
#include "wanwan_channel.h"
#include <time.h>
#include <stdlib.h>
#include <stdio.h>




int main(int argc, char **argv) {

    wanwan_String * str = wanwan_string_create("test");
    wanwan_Channel * c = wanwan_channel_create(str);
    printf("%s\n", wanwan_channel_exists(c) ? "It exists" : "It doesn't exist");
    

    /*
    char * query = getenv("QUERY_STRING");
    char * ip    = getenv("REMOTE_ADDR");


    wanwan_Client * client = wanwan_client_create(query, ip);
    wanwan_Server * server = wanwan_server_create();


    switch(wanwan_client_get_request(client)) {
      case wanwan_Request_PostMessage:
        wanwan_response_push(wanwan_Response_SendMessage, client, server);

    }
    wanwan_response_push(wanwan_Response_SendMessage, client, server);
    wanwan_response_send();
    */

    return 0;
}

