#include <stdlib.h>
#include <stdio.h>
#include <math.h>

#include "fast_math.h"
#include "hokuyo_config.h"


static inline int max(int a,int b){ return (a>b) ? a : b ; }
static inline int min(int a,int b){ return (a<b) ? a : b ; }

int
dist_squared(Pt_t p1, Pt_t p2)
{
	int r = pow(p2.x-p1.x, 2) + pow(p2.y-p1.y, 2);
	return r;
}

int
dist_to_edge(Pt_t p, int largeurX, int largeurY) // fonction qui ne sert à rien XXX
{
	int x_to_edge = min(p.x, largeurX - p.x);
	int y_to_edge = min(p.y, largeurY - p.y);
	int res = min(x_to_edge, y_to_edge);
	return res;
}


struct fastmathTrigo
initFastmath(int n, double *angles)
{
	struct fastmathTrigo r;

	r.n = n;
	r.cos = malloc(sizeof(double) * n);
	r.sin = malloc(sizeof(double) * n);
	if(r.cos == NULL || r.sin == NULL) {
		printf("\n%sFatal error in mallocs > initFastmath...\n", PREFIX);
		exit(EXIT_FAILURE);
	}

	//printf("Should print anles from -90 to 0\n");
	for(int i=0; i<n; i++){
		r.cos[i] = cos(angles[i]);
		r.sin[i] = sin(angles[i]);
		//printf("%f\tx:%f\ty:%f\n", angles[i]*180/PI, r.cos[i], r.sin[i]);
	}

	return r;
}

double angle(Pt_t p1, Pt_t p2) {
	return atan2(p2.y - p1.y, p2.x - p1.x);
}

void
freeFastmath(struct fastmathTrigo s)
{
	free(s.cos);
	s.cos = 0;
	free(s.sin);
	s.sin = 0;
}

double
fastCos(struct fastmathTrigo f, int index)
{
	//printf("asked fastCos(%i)=%lf\n", index, f.cos[index]);
	return f.cos[index];
}

double
fastSin(struct fastmathTrigo f, int index)
{
	return f.sin[index];
}

double modTwoPi(double a) {
	while (a <= -M_PI ) {
		a += 2*M_PI;
	}
	while (a >= M_PI) {
		a -= 2*M_PI;
	}
	return a;
}
