#include "wanwan_sleep.h"

#ifdef WIN32
    #include <windows.h>

    void wanwan_sleep() {
        Sleep(50);
    }

#elif (defined (__UNIX__) || defined (LINUX) || defined(linux) || defined(unix))
    #include <unistd.h>

    void wanwan_sleep() {
        usleep(1000*50);
    }
#else 
    #include <stdlib.h>

    void wanwan_sleep() {
        sleep(1);
    }
#endif

