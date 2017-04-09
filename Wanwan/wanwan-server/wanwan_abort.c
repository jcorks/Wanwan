#include "wanwan_abort.h"
#include <stdio.h>
#include <stdlib.h>


void wanwan_abort() {
    // try to fake the CGI not existing really lazily
    // ideally, you would generate the page that the webserver page generates
    printf("Status: 404 Not Found\r\n");
    printf("Content-Type: text/html\r\n\r\n");

    printf("<h1>404 File not found!</h1>");
    exit(0);    
}
