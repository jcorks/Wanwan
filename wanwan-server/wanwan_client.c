#include "wanwan_client.h"
#include "wanwan_env.h"

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <inttypes.h>

#define REQUEST_QUERY  "WANWANSQRY"
#define REQUEST_POST   "WANWANPOST"
#define REQUEST_UPDATE "WANWANUPDT"



struct wanwan_Client {
    wanwan_String * name;
    wanwan_String * colorString;
    wanwan_String * ip;
    wanwan_String * message;
    wanwan_Channel * channel;
    uint64_t index;
    wanwan_ClientRequest request;
    uint64_t clientVersion;
};

wanwan_String * generate_color(const wanwan_String * ip, const wanwan_String * name) {

    uint8_t r = 0, g = 0, b = 0, a = 0;
    
    uint32_t i = 0;

    int seed = 0;
    sscanf(wanwan_string_get_cstr(ip), "%hhu.%hhu.%hhu.%hhu", &r, &g, &b, &a);
    seed += r+a;
    seed += g*255+a;
    seed += b*0xFFFF+a;


    for(; i < wanwan_string_length(name); ++i) {
        switch(i%3) {
          case 0: seed+=(g+b)+wanwan_string_get_cstr(name)[i]; break;
          case 1: seed+=(r+b)+wanwan_string_get_cstr(name)[i]; break;
          case 2: seed+=(r+g)+wanwan_string_get_cstr(name)[i]; break;
        }
    }

    srand(seed);
    r = (rand() / (float)RAND_MAX)*128 + 128;
    g = (rand() / (float)RAND_MAX)*128 + 128;
    b = (rand() / (float)RAND_MAX)*128 + 128;

    

    return wanwan_string_create_format("rgb(%i, %i, %i)", r, g, b);

}

wanwan_Client * wanwan_client_create(
    const char * query,
    const char * ip) {


    uint32_t i;
    wanwan_Client * c = calloc(1, sizeof(wanwan_Client));
    c->index         = UINT64_MAX;
    c->ip            = wanwan_string_create(ip);
    c->request       = wanwan_Request_Invalid;
    c->channel       = wanwan_channel_create("", "");
    c->colorString   = wanwan_string_create("#79C"); // should calculate based on ip and username
    c->clientVersion = 0;

    // debugging only.    
    if (!wanwan_string_length(c->ip))
        wanwan_string_set(c->ip, "255.255.255.255");
        
    

    wanwan_String ** input = NULL;
    uint32_t length = 0;
    wanwan_String * queryStr = wanwan_string_create(query);
    wanwan_string_dehexify(queryStr, &input, &length);


    if (length == 0) goto L_FAIL;
    const char * name = wanwan_string_get_cstr(input[0]);
    

    if (!strcmp(name, REQUEST_UPDATE)) {
        if (length != 3) goto L_FAIL;
        c->request   = wanwan_Request_Update;
        c->channel   = wanwan_channel_create(wanwan_string_get_cstr(input[1]), wanwan_env_get_storage_path());
        if (!sscanf(wanwan_string_get_cstr(input[2]), "%"PRIu64, &c->index)) goto L_FAIL; 
    } else if(!strcmp(name, REQUEST_POST)) {
        if (length != 4) goto L_FAIL;
        c->request   = wanwan_Request_PostMessage;      
        c->name      = wanwan_string_copy(input[1]);
        c->message   = wanwan_string_copy(input[2]);
        c->channel   = wanwan_channel_create(wanwan_string_get_cstr(input[3]), wanwan_env_get_storage_path());
        c->colorString = generate_color(c->ip, c->name);
    } else if(!strcmp(name, REQUEST_QUERY)) {
        if (length != 2) goto L_FAIL;
        c->request   = wanwan_Request_ServerQuery;
        if (!sscanf(wanwan_string_get_cstr(input[1]), "%"PRIu64, &c->clientVersion)) goto L_FAIL; 
    }




  L_FAIL:
    for(i = 0; i < length; ++i) {
        wanwan_string_destroy(input[i]);
    }    

    return c;
}


const wanwan_String * wanwan_client_get_name(const wanwan_Client * c) {
    return c->name;
}

const wanwan_String * wanwan_client_get_color(const wanwan_Client * c) {
    return c->colorString;
}

const wanwan_String * wanwan_client_get_ip(const wanwan_Client * c) {
    return c->ip;
}

const wanwan_String * wanwan_client_get_message(const wanwan_Client * c) {
    return c->message;
}



wanwan_ClientRequest wanwan_client_get_request(const wanwan_Client * c) {
    return c->request;
}   

const wanwan_Channel * wanwan_client_get_channel(const wanwan_Client * c) {
    return c->channel;
}

uint64_t wanwan_client_get_version(const wanwan_Client * c) {
    return c->clientVersion;
}


uint64_t wanwan_client_get_index(const wanwan_Client * c) {
    return c->index;
}
