#ifndef H_WANWAN_STRING_INCLUDED
#define H_WANWAN_STRING_INCLUDED

#include <stdint.h>

// maximum byte-length of a string possible
#define WANWAN_STRING_MAX_LENGTH 4096*2

typedef struct wanwan_String wanwan_String;


// returns a "safe" copy of the given string.
wanwan_String * wanwan_string_create(const char *);
wanwan_String * wanwan_string_create_format(const char *, ...);

void wanwan_string_destroy(wanwan_String *);


// reutnrs the number of characters within the string
uint16_t wanwan_string_length(const wanwan_String *);


// updates the string safely.
void wanwan_string_set(wanwan_String *, const char * data);


// allocates a safe copy of the contents
// the return value should be freed
const char * wanwan_string_get_cstr (const wanwan_String *);
char *       wanwan_string_copy_cstr(const wanwan_String *);


wanwan_String * wanwan_string_copy(const wanwan_String*);

// A = A+B, A is returned
wanwan_String * wanwan_string_concatenate       (wanwan_String * A, const wanwan_String * B);
wanwan_String * wanwan_string_concatenate_cstr  (wanwan_String * A, const char * B);
wanwan_String * wanwan_string_concatenate_format(wanwan_String * A, const char * format, ...);


wanwan_String * wanwan_string_hexify(wanwan_String **, uint32_t count);
void wanwan_string_dehexify(const wanwan_String * src, wanwan_String *** dest, uint32_t * count);



#endif
