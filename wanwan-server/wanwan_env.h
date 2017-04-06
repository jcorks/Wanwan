#ifndef H_WANWAN_ENV_DEFINED
#define H_WANWAN_ENV_DEFINED



// returns whether the Environment requests
// that all requests sent by the server be given without 
// the CORS header, disallowing Wanwan server responses from a 
// different domain. The default is FALSE.
//
// To disable, just define environemnt variable:
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


// returns whether users are allowed to add channels. The default is to 
// disallow it.
//
// To allow, just define the environment variable:
//
//      WANWAN_SERVER__ENABLE_CHANNEL_CREATION
//
int wanwan_env_get_allow_channel_creation();






// returns the maximum number of characters a user is allowed 
// to have in their query in hex form. The default is a query of 
// 32 KB
//uint64_t wanwan_env_get_max_query_length();





#endif
