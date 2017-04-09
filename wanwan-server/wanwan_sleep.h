#ifndef H_WANWAN_SLEEP_INCLUDED
#define H_WANWAN_SLEEP_INCLUDED


// sleeps for a non-specified amount of time. The only guarantee is that
// at the longest, it will sleep around a second and at the shortest it 
// will sleep around 50 ms. On systems that support it, it should 
// sleep close to 50 ms.

void wanwan_sleep();


#endif
