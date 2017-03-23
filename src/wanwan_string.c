#include "wanwan_string.h"
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <stdio.h>
#define WANWAN_STRING_ALLOCTAG 0xDE0AFEF5
#define WANWAN_STRING_VALID(__S__) ((__S__) && ((__S__)->allocTag==WANWAN_STRING_ALLOCTAG))

struct wanwan_String {
    uint32_t allocTag;
    char * data;
    uint16_t length;
};





wanwan_String * wanwan_string_create(const char * d) {
    wanwan_String * out = calloc(1, sizeof(wanwan_String));
    out->allocTag = WANWAN_STRING_ALLOCTAG;
    if (!d) {
        out->data = calloc(1, 1);
        out->length = 0;
        return out;
    }
    wanwan_string_set(out, d);
    return out;
}


void wanwan_string_destroy(wanwan_String * str) {
    if (!WANWAN_STRING_VALID(str)) return;
    str->allocTag = 0;
    free(str->data);
    free(str);
}



void wanwan_string_set(wanwan_String * str, const char * data) {
    if (!WANWAN_STRING_VALID(str)) return;
    if (str->data) {
        free(str->data);
        str->data = NULL;
    }
    size_t actualLength = strlen(data);
    str->length = actualLength > WANWAN_STRING_MAX_LENGTH ? WANWAN_STRING_MAX_LENGTH : actualLength;
    str->data = calloc(str->length+1, 1);
    memcpy(str->data, data, str->length);
}


uint16_t wanwan_string_length(const wanwan_String * str) {
    if (!WANWAN_STRING_VALID(str)) return 0;
    return str->length;
}

char * wanwan_string_get_cstr(const wanwan_String * str) {
    if (!WANWAN_STRING_VALID(str)) return strdup("");
    char * out = calloc(1, str->length+1);
    if (!out) return strdup("");
    memcpy(out, str->data, str->length+1);
    return out;
}

wanwan_String * wanwan_string_copy(const wanwan_String * str) {
    if (!WANWAN_STRING_VALID(str)) return wanwan_string_create("");
    return wanwan_string_create(str->data);    
}


wanwan_String * wanwan_string_concatenate(wanwan_String * A, const wanwan_String * B) {
    if (!WANWAN_STRING_VALID(B)) return A;    
    return wanwan_string_concatenate_cstr(A, B->data);
}

wanwan_String * wanwan_string_concatenate_cstr(wanwan_String * A, const char * B) {
    if (!WANWAN_STRING_VALID(A) || !B) return A;
    size_t lenB = strlen(B);     
    if (lenB == 0) return A;
    char * newBuffer = calloc(A->length + lenB + 2, 1);
    if (!newBuffer) return A;
    strcat(newBuffer, A->data);
    strcat(newBuffer, B);

    wanwan_string_set(A, newBuffer);
    free(newBuffer);
    return A;
}


wanwan_String * wanwan_string_concatenate_format(wanwan_String * A, const char * format, ...) {
    if (!WANWAN_STRING_VALID(A)) return A;
    static char * strB = NULL;
    if (!strB)
        strB = calloc(WANWAN_STRING_MAX_LENGTH+1, 1);

    strB[0] = 0;
    va_list args;
    va_start(args, format);
    vsnprintf(strB, WANWAN_STRING_MAX_LENGTH, format, args);

    va_end(args);
    return wanwan_string_concatenate_cstr(A, strB);
}


wanwan_String * wanwan_string_hexify(wanwan_String ** A, uint32_t count) {
    // every byte is represented as 2 bytes now 
    wanwan_String * out = wanwan_string_create("");
    size_t i = 0, n = 0;
    for(; n < count; ++n) {
        char * subOut = calloc((A[n]->length * 2)+1+4, 1);
        strcat(subOut, "00");
        for(i = 1; i < A[n]->length; ++i) {
            snprintf(subOut+i*2, 3, "%02x", A[n]->data[i]);
        }
        strcat(subOut, "00");
        wanwan_string_concatenate_cstr(out, subOut);
        free(subOut);
    }
    wanwan_string_concatenate_cstr(out, "00");
    return out;
}
