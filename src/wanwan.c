#include <string.h>
#include "wanwan_client.h"
#include "wanwan_server.h"
#include "wanwan_response.h"
#include "wanwan_channel.h"
#include <time.h>
#include <stdlib.h>
#include <stdio.h>




int main(int argc, char **argv) {
   
    
    {
        wanwan_Channel * c = wanwan_channel_create("Lobby");
        if (!wanwan_channel_exists(c)) {
            wanwan_channel_initialize(c, "A testing channel.");
        }
    }
    
    char * query = getenv("QUERY_STRING");
    char * ip    = getenv("REMOTE_ADDR");
    //char * query = "0057414e57414e504f53540000446155736572000048656c6c6f2c20776f726c64210000436f72652e53706565636800007465737400";
    //char * query = "0057414e57414e5550445400007465737400003000"; // update test;
    //char * ip    = "127.0.0.1"; ////getenv("REMOTE_ADDR");


    wanwan_Client * client = wanwan_client_create(query, ip);
    //wanwan_Server * server = wanwan_server_create();


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
        wanwan_response_send();
        break;
        


    // give the client all the messages they don't have yet
      case wanwan_Request_Update: {
        wanwan_String ** messages = NULL;
        uint64_t messageCount   = 0;
        wanwan_channel_get_messages_since(
            wanwan_client_get_channel(client), 
            wanwan_client_get_index(client), 
            &messages, 
            &messageCount
        );


        uint64_t i = 0;

        for(; i < messageCount; ++i) {
            wanwan_response_push_compiled_message(messages[i]);
        }
        wanwan_response_send();

        break;
       }
        
      default:
        // try to fake the CGI not existing
        printf("Status: 404 Not Found\n");
        return 0;            
    }


    

    return 0;
}

