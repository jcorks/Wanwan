#include "wanwan_channel.h"
#include "wanwan_sleep.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <inttypes.h>

//#define WANWAN_CHANNEL_FILE_PREFIX "ww_"
#define WANWAN_CHANNEL_FILE_PREFIX "ww_"
#define WANWAN_CHANNEL_INDEX_SUFFIX "_index"
#define WANWAN_CHANNEL_INFO_SUFFIX "_info"
#define WANWAN_CHANNEL_LOCK_SUFFIX "_lock"
#define WANWAN_CHANNEL_HISTORY_SUFFIX "_history"



/////
/*
    ww_channel_index
        binary data table holding file positions of where each message starts in the history file.
        no parity or anything, just full of uint64_t's sequentially. The last uint64_t 
        is the number of indices, and each uint starting at 0 one is message start indices.
        The last index should say where the next message would start. Note that due to the indexing 
        style, the number of indices at the start of the file will be one less than the 
        number of byte offsets in the file

    ww_channel_history
        ascii file containing ready-to-send messages.

    ww_channel_info
        ascii file containing the description of the channel

    ww_channel_lock
        temporary file that's created when performing a read or 
        write of ww_channel_index / history to help prevent race conditions 
        

    


*/


struct wanwan_Channel {
    char * name;
    char * indexFile;
    char * historyFile;
    char * infoFile;
    char * lockFile;
};

static int get_index_table(FILE *, uint64_t **, uint64_t * length);
static int update_index_table(FILE *, uint64_t *, uint64_t length, uint64_t newMessagelength);
static void wait_for_unlock(const char *);

wanwan_Channel * wanwan_channel_create(const char * name, const char * basePath) {
    wanwan_Channel * channel = calloc(1, sizeof(wanwan_Channel));

    wanwan_String * channelName = wanwan_string_create(name);
    if (!wanwan_string_length(channelName)) {
        wanwan_string_destroy(channelName);
        return channel;
    }    
    char * nameStr = wanwan_string_copy_cstr(channelName);

    wanwan_String * channelIndexFile   = wanwan_string_create_format("%s%s%s%s",basePath, WANWAN_CHANNEL_FILE_PREFIX, nameStr, WANWAN_CHANNEL_INDEX_SUFFIX);
    wanwan_String * channelHistoryFile = wanwan_string_create_format("%s%s%s%s",basePath, WANWAN_CHANNEL_FILE_PREFIX, nameStr, WANWAN_CHANNEL_HISTORY_SUFFIX);
    wanwan_String * channelInfoFile    = wanwan_string_create_format("%s%s%s%s",basePath, WANWAN_CHANNEL_FILE_PREFIX, nameStr, WANWAN_CHANNEL_INFO_SUFFIX);
    wanwan_String * channelLockFile    = wanwan_string_create_format("%s%s%s%s",basePath, WANWAN_CHANNEL_FILE_PREFIX, nameStr, WANWAN_CHANNEL_LOCK_SUFFIX);
    
    channel->name        = nameStr;
    channel->indexFile   = wanwan_string_copy_cstr(channelIndexFile);
    channel->historyFile = wanwan_string_copy_cstr(channelHistoryFile);
    channel->infoFile    = wanwan_string_copy_cstr(channelInfoFile);
    channel->lockFile    = wanwan_string_copy_cstr(channelLockFile);


    wanwan_string_destroy(channelIndexFile);
    wanwan_string_destroy(channelHistoryFile);
    wanwan_string_destroy(channelInfoFile);
    wanwan_string_destroy(channelLockFile);


    wanwan_string_destroy(channelName);


    return channel;
}


const wanwan_String * wanwan_channel_get_name(const wanwan_Channel * c) {
    static wanwan_String * str = NULL;
    if (!str) str = wanwan_string_create("");
    wanwan_string_set(str, c->name);
    return str;
}

const wanwan_String * wanwan_channel_get_description(const wanwan_Channel * c) {
    static wanwan_String * str = NULL;

    // have to read through description
    if (!str) str = wanwan_string_create("");
    wanwan_string_set(str, "TODO");
    return str;
}



uint64_t wanwan_channel_get_messages_since(const wanwan_Channel * c, uint64_t clientIndex, wanwan_String *** newMessages, uint64_t * count) {
    uint64_t * index = NULL;
    uint64_t indexSize = 0;
    uint64_t i, messageIter = 0;
    

    FILE * indexFile = fopen(c->indexFile, "rb");
    FILE * historyFile = fopen(c->historyFile, "rb");

    *newMessages = NULL;
    *count = 0;




    if (!indexFile || !historyFile) goto L_FAIL;

    if (!get_index_table(indexFile, &index, &indexSize)) goto L_FAIL;

    // well i'll be; they're up-to-date
    if (indexSize == clientIndex) goto L_FAIL;

    // time traveler?
    if (indexSize <  clientIndex) goto L_FAIL;


    

    // gather the messages
    *newMessages = calloc((indexSize - clientIndex), sizeof(wanwan_String*));

        
    i = clientIndex;
    for(; i < indexSize; ++i) {
        fseek(historyFile, index[i], 0);
        size_t strLength = index[i+1] - index[i];
        char * messageStr = malloc(strLength+1);
        messageStr[strLength] = 0;
        if (strLength != fread(messageStr, 1, strLength, historyFile)) {
            free(messageStr);
            goto L_FAIL;
        }
        (*newMessages)[messageIter++] = wanwan_string_create(messageStr);
        free(messageStr);
    }
    

    *count = messageIter;
    if (indexFile) fclose(indexFile);
    if (historyFile) fclose(historyFile);
    free(index);


    return indexSize;

L_FAIL:

    for(i = 0; i < messageIter; ++i) {
        wanwan_string_destroy((*newMessages)[i]);
    }
    free(*newMessages);
    *count = 0;

    if (indexFile) fclose(indexFile);
    if (historyFile) fclose(historyFile);

    free(index);
    return clientIndex;
}




void wanwan_channel_write_message(
        const wanwan_Channel *c,  
        const wanwan_String * name,
        const wanwan_String * messageText,
        const wanwan_String * color) {
    wanwan_String * message[5];

    message[0] = (wanwan_String*)wanwan_string_create("WANWANMSG");
    message[1] = (wanwan_String*)name;
    message[2] = (wanwan_String*)messageText;
    message[3] = (wanwan_String*)color;
    message[4] = (wanwan_String*)wanwan_string_create("");    

    // history should get updated first, then index.
    // flush when done.
    

    wait_for_unlock(c->lockFile);

    
    FILE * lock = fopen(c->lockFile, "w");
    fprintf(lock, "%s", "bark bark");
    fflush(lock);
    fclose(lock);   



    // read index. this will also let us populate the 
    // new message's index property
    uint64_t * indexData = NULL;
    uint64_t indexLength = 0;
    FILE * index = fopen(c->indexFile, "rb");
    get_index_table(index, &indexData, &indexLength);
    fclose(index);
    wanwan_string_concatenate_format(message[4], "%"PRIu64"", indexLength+1);
    

    // convert message to single hex string and insert it in channel's history
    wanwan_String * hexMessage = wanwan_string_hexify(message, 5);
    FILE * history = fopen(c->historyFile, "ab");
    const char * str = wanwan_string_get_cstr(hexMessage);
    fwrite(str, 1, wanwan_string_length(hexMessage), history);
    fflush(history);
    fclose(history);



    index = fopen(c->indexFile, "wb");
    if (index) {
        update_index_table(index, indexData, indexLength, wanwan_string_length(hexMessage));
        fflush(index);
        fclose(index);
    }

    remove(c->lockFile);
    wanwan_string_destroy(message[0]);
    wanwan_string_destroy(message[4]);
}



int wanwan_channel_exists(const wanwan_Channel * c) {
    FILE * f = fopen(c->indexFile, "r");
    if (!f) return 0;
    fclose(f);
    return 1;
}




int wanwan_channel_initialize(const wanwan_Channel * a, const char * description) {
    if (!description) return 0;

    remove(a->indexFile);   
    remove(a->historyFile);   
    remove(a->infoFile);
    remove(a->lockFile);

    FILE * indexFile = fopen(a->indexFile, "wb");
    uint64_t start = 0;
    fwrite(&start, sizeof(uint64_t), 1, indexFile);
    fwrite(&start, sizeof(uint64_t), 1, indexFile);
    fflush(indexFile);
    fclose(indexFile);

    
    FILE * infoFile = fopen(a->infoFile, "w");
    fprintf(infoFile, "%s", description);
    fflush(infoFile);
    fclose(infoFile);

   
    return 1;     
}





int get_index_table(FILE * f, uint64_t ** table, uint64_t * length) {
    if (!fread(length, sizeof(uint64_t), 1, f)) return 0;
    *table = malloc((*length+1) * sizeof(uint64_t));
    if ((*length+1) != fread(*table, sizeof(uint64_t), (*length+1), f)) {
        free(*table);
        *table = NULL;
        *length = 0;
        return 0;
    }
    return 1;
}

// TODO how handle error when writing? Need a backup copy? Force trying again?

int update_index_table(FILE * f, uint64_t * table, uint64_t length, uint64_t messageLength) {
    uint64_t indexNewLength = length+1;
    fwrite(&indexNewLength, sizeof(uint64_t), 1, f);
    fwrite(table, sizeof(uint64_t), length+1, f);

    uint64_t messageLocation = table[length] + messageLength;
    fwrite(&messageLocation, sizeof(uint64_t), 1, f);
    return 1;
}


void wait_for_unlock(const char * lock) {
    FILE * file = fopen(lock, "r");
    while(file) {
        fclose(file);
        wanwan_sleep();
        file = fopen(lock, "r");        
    }   
}


