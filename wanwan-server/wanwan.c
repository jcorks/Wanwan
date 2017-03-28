#include <string.h>
#include "wanwan_client.h"
#include "wanwan_server.h"
#include "wanwan_response.h"
#include "wanwan_channel.h"
#include "wanwan_sleep.h"

#include <inttypes.h>
#include <time.h>
#include <stdlib.h>
#include <stdio.h>


char * wanwan_get_post_message();

int main(int argc, char **argv) {
   

    // gather environment variables
    char * query    = wanwan_get_post_message();
    char * ip       = getenv("REMOTE_ADDR")         ? strdup(getenv("REMOTE_ADDR"))         : NULL;

    // The following env variables are specific to WANWAN

    // WANWAN_CHANNEL_PATH denotes the path that wanwan should use to manage 
    // channels. Note that wanwan won't create any directories, only regular files.
    char * mainPath = getenv("WANWAN_CHANNEL_PATH") ? strdup(getenv("WANWAN_CHANNEL_PATH")) : NULL;


    


    {
        wanwan_Channel * c = wanwan_channel_create("Lobby");
        if (!wanwan_channel_exists(c)) {
            wanwan_channel_initialize(c, "A testing channel.");
        }
    }
    

    






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
        // try to fake the CGI not existing really lazily
        // ideally, you would generate the page that the webserver page generates
        printf("Status: 404 Not Found\r\n");
        printf("Content-Type: text/html\r\n\r\n");

        printf("<h1>404 File not found!</h1>");
        return 0;            
    }


    

    return 0;
}






char * wanwan_get_post_message() {
    uint64_t messageLen = 0;
    char * message;

    if (!fscanf(stdin, "%"PRIu64"&", &messageLen)) goto L_FAIL;
    if (messageLen == UINT64_MAX) goto L_FAIL; // nice try
    if (!(message = calloc(1, messageLen+1))) goto L_FAIL;


    message[messageLen] = 0;
    fread(message, messageLen, 1, stdin);
    return message;

  L_FAIL:
    // try to fake the CGI not existing really lazily
    // ideally, you would generate the page that the webserver page generates
    printf("Status: 404 Not Found\r\n");
    printf("Content-Type: text/html\r\n\r\n");

    printf("<h1>404 File not found!</h1>");
    exit(0);    
    return NULL;

}
