#include <time.h>
#include <sys/time.h>

#include "compat.h"

int serial;

long timeMillis() {
        struct timeval tv;       
        if(gettimeofday(&tv, NULL) != 0) return 0;
        return (unsigned long)((tv.tv_sec * 1000ul) + (tv.tv_usec / 1000ul));        
}
