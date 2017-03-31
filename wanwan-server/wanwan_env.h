#ifndef H_WANWAN_ENV_DEFINED
#define H_WANWAN_ENV_DEFINED



// returns whether the Environment requests
// that all requests sent by the server be given without 
// the CORS header, disallowing Wanwan server responses from a 
// different domain. The default is FALSE.
//
// environemnt variable:
//
//      WANWAN_SERVER__DISABLE_CORS
//
int wanwan_env_get_disable_cors_header();


// returns the address of the client. If none 
// can be found, the string returned is "127.0.0.1"
// (this environment variable is generated from the server environment)
const char * wanwan_env_get_remote_address();


// returns the input query to the server.
// (this environment variable is populated by the server environment)
const char * wanwan_env_get_query();

// returns the base path where files cna be written to.
//
// environment variable:
//
//      WANWAN_SERVER__STORAGE_PATH
const char * wanwan_env_get_storage_path();






#endif
