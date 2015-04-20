#ifndef COMPAT_H
#define COMPAT_H

typedef enum bool 
{ 
	true = 1, false = 0 
} bool;

long timeMillis();


//Segfault on printf(<int>)
#ifdef DEBUG
#define PDEBUGLN(x) /*printf(x);printf("\n");*/
#define PDEBUG(x) /*printf(x);*/
#else

#define PDEBUGLN(x)
#define PDEBUG(x)

#endif
#endif
