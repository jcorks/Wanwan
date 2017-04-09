#include <string.h>
#include "wanwan_client.h"
#include "wanwan_server.h"
#include "wanwan_response.h"
#include "wanwan_channel.h"
#include "wanwan_sleep.h"
#include "wanwan_env.h"
#include "wanwan_abort.h"

#include <inttypes.h>
#include <time.h>
#include <stdlib.h>
#include <stdio.h>


#define WANWAN__SUPPORTED_CLIENT_VERSION 0


char * wanwan_get_post_message();

int main(int argc, char **argv) {
   

    // gather environment variables
    const char * query    = wanwan_env_get_query();
    const char * ip       = wanwan_env_get_remote_address();
    const char * mainPath = wanwan_env_get_storage_path();

    {
        wanwan_Channel * c = wanwan_channel_create("Lobby", mainPath);
        if (!wanwan_channel_exists(c)) {
            wanwan_channel_initialize(c, "A testing channel.");
        }
    }
    
    wanwan_Client * client = wanwan_client_create(query, ip);

    switch(wanwan_client_get_request(client)) {


    // The initial request makes sure that the client will be able to handle 
    // reswponses from the server.
      case wanwan_Request_ServerQuery: {
        wanwan_String * temp = (wanwan_client_get_version(client) == 0) ?
                wanwan_string_create("WANWANOKAY")
              :
                wanwan_string_create("WANWANDENY");

        wanwan_String * out = wanwan_string_hexify(
            &temp, 1
        );    
        wanwan_response_push_compiled_message(out);
        wanwan_response_send();
        wanwan_string_destroy(temp);
        wanwan_string_destroy(out);
        }
        break;        

    
    // request to post a message. they won't see it until their
    // next update
      case wanwan_Request_PostMessage:
        wanwan_channel_write_message(
            wanwan_client_get_channel   (client), 
            wanwan_client_get_name      (client),
            wanwan_client_get_message   (client),
            wanwan_client_get_color     (client)
        );
        wanwan_response_send();
        break;
        


    // give the client all the messages they don't have yet
      case wanwan_Request_Update: {
        time_t curTime = time(NULL);

        wanwan_String ** messages = NULL;
        uint64_t messageCount   = 0;

        while(!messageCount && (time(NULL) - curTime < 8)) {
            wanwan_channel_get_messages_since(
                wanwan_client_get_channel(client), 
                wanwan_client_get_index(client), 
                &messages, 
                &messageCount
            );
            if (!messageCount) {
                wanwan_sleep();
            }
        }


        uint64_t i = 0;

        for(; i < messageCount; ++i) {
            wanwan_response_push_compiled_message(messages[i]);
        }
        wanwan_response_send();

        break;
       }
        
      default:
        wanwan_abort();       
    }


    

    return 0;
}



