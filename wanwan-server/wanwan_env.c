#include "wanwan_env.h"
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <inttypes.h>
#include <stdio.h>

int wanwan_env_get_disable_cors_header() {
    static char * enable = NULL;
    if (enable) return *enable;


    enable = malloc(1);
    assert(enable);        
    
    char * src = getenv("WANWAN_SERVER__USE_CORS");

    // if no entry, assume it is enabled.
    if (!src) 
        *enable = 0;
    else 
        *enable = 1;        

    return wanwan_env_get_disable_cors_header();
}


const char * wanwan_env_get_remote_address() {
    static char * addr = NULL;
    if (addr) return addr;

    // CGI standard to supply address of client 
    // through this env var
    char * src = getenv("REMOTE_ADDR");

    if (!src)
        addr = strdup("127.0.0.1");
    else 
        addr = strdup(src);

    return wanwan_env_get_remote_address();
}



const char * wanwan_env_get_query() {
    static char * query = NULL;
    if (query) return query;


    uint64_t messageLen = 0;

    if (!fscanf(stdin, "%"PRIu64"&", &messageLen)) goto L_FAIL;
    if (messageLen == UINT64_MAX) goto L_FAIL; // nice try
    if (!(query = calloc(1, messageLen+1))) goto L_FAIL;


    query[messageLen] = 0;
    fread(query, messageLen, 1, stdin);
    return wanwan_env_get_query();

  L_FAIL:
    query = strdup("");
    return wanwan_env_get_query();
}



const char * wanwan_env_get_storage_path() {
    static char * path = NULL;
    if (path) return path;


    char * src = getenv("WANWAN_SERVER__STORAGE_PATH");
    if (!src)
        path = "/home/jc/WANWAN/";
    else 
        path = strdup(src);
    return wanwan_env_get_storage_path();
}


