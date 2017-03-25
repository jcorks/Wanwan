#include <string.h>
#include "wanwan_client.h"
#include "wanwan_server.h"
#include "wanwan_response.h"
#include "wanwan_channel.h"
#include <time.h>
#include <stdlib.h>
#include <stdio.h>




int main(int argc, char **argv) {

    /*    
    wanwan_String * str = wanwan_string_create("test");

    wanwan_Channel * c = wanwan_channel_create(str);
    if (!wanwan_channel_exists(c))
        wanwan_channel_initialize(c, "This is a test");
    printf("%s\n", wanwan_channel_exists(c) ? "It exists" : "It doesn't exist");

    str = (wanwan_String *)wanwan_channel_get_name(c);
    printf("Name: %s\n", wanwan_string_get_cstr(str));

    str = (wanwan_String *)wanwan_channel_get_description(c);
    printf("Desc: %s\n", wanwan_string_get_cstr(str));


    srand(time(NULL));
    
    wanwan_string_set(str, "");
    wanwan_string_concatenate_format(str, "Hello %d", rand());
    wanwan_channel_write_message(c, str);


    wanwan_String ** messages = NULL;
    uint64_t messageCount   = 0;
    uint64_t index = wanwan_channel_get_messages_since(c, 10, &messages, &messageCount);
    uint64_t i = 0;
    for(; i < messageCount; ++i) {
        char * message = wanwan_string_get_cstr(messages[i]);
        printf("Message%llu  : %s\n", i, message);   
        free(message);
    }

    printf("(index %llu)\n", index);
    */    
    

    
    char * query = getenv("QUERY_STRING");
    char * ip    = getenv("REMOTE_ADDR");


    wanwan_Client * client = wanwan_client_create(query, ip);
    wanwan_Server * server = wanwan_server_create();


    switch(wanwan_client_get_request(client)) {


    // request to post a message. they won't see it until their
    // next update
      case wanwan_Request_PostMessage:
        wanwan_channel_write_message(
            wanwan_client_get_channel   (client), 
            wanwan_client_get_name      (client),
            wanwan_client_get_message   (client),
            wanwan_client_get_color     (client),
            wanwan_client_get_animation (client)
        );
        break;
        
      default:
        // try to fake the CGI not existing
        printf("Status: 404 Not Found\n");
        return 0;            
    }
    

    return 0;
}

