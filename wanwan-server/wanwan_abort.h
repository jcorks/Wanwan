#ifndef H_WANWAN_ABORT_INCLUDED
#define H_WANWAN_ABORT_INCLUDED

// Exits the server process in a standardized way.
// This posts a message giving a 404 error.
// as not to give out too much information on what's 
// going on. 
void wanwan_abort();

#endif
