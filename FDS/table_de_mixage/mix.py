from .music import *
from .ax12 import *

t_sd = 0

def lunchMix(s, t):
	if t == 0:
		playMusic(s)
		lunchMix.t_sd = 0
	if s == "home":
		ax12.move(getAX12PosFor("home"))
	if s == "buzz_leclair_infini":
		if t>=0 and t<2:
			ax12.move([240,60,240,60,240,150])
		elif t>=2:
			ax12.move([240,210,150,60,240,150])
	if s == "stolen_dance":
		if t > tempo_stolen_dance[lunchMix.t_sd] - 1.654016:
			lunchMix.t_sd += 1
		if lunchMix.t_sd < 18:
			if lunchMix.t_sd%2 == 0:
				ax12.move(getAX12PosFor("applause_open"))
			else:
				ax12.move(getAX12PosFor("applause_close"))
		else:
			if lunchMix.t_sd%2 == 0:
				ax12.move(getAX12PosFor("vague1_l"))
			else:
				ax12.move(getAX12PosFor("vague1_r"))
	if s == "symetric_hand":
		ax12.stopTorque([1,2,3])
		ax12.write(4, 300-ax12.read(1))
		ax12.write(5, 300-ax12.read(2))
		ax12.write(6, 300-ax12.read(3))
	if s == "symetric_hand":
		pass

def stopMix(s):
	stopMusics()
	if s == "symetric_hand":
		lunchMix("home", 0)

tempo_stolen_dance=[2.058016,2.409905,2.897159,3.420422,3.938955,4.488675,4.986282,5.53373,\
6.043402,6.569312,7.101861,7.654766,8.17242,8.693614,9.224893,9.767137,10.278366,10.731506,\
11.267028,11.826951,12.345414,12.901499,13.423419,13.997373,14.495231,14.965658,15.533192,\
16.096857,16.647109,17.166093,17.678836,18.242097,18.748715,19.244338,19.844007,20.36462,\
20.888173,21.405088,21.896922,22.463591,22.951763,23.476911,24.019115,24.561897,25.078287,\
25.605882,26.146517,26.726687,27.183298,27.745591,28.264019,28.734704,29.274295,29.695291,\
30.240127,30.723286,31.234157,31.692605,32.210967,32.615058,33.078452,33.585985,34.074033,\
34.566405,35.144779,35.635106,36.147309,36.68865,37.261671,37.778151,38.325435,38.897446,\
39.448527,39.92442,40.468888,40.989032,41.535975,42.05721,42.573598,43.058018,43.639075,\
44.139236,44.641019,45.279415,45.816645,46.307819,46.843035,47.345056,47.885074,48.385098,\
48.913109,49.34405,49.807462,50.313508,50.768587,51.194842,51.698888,52.195525,52.66455,\
53.18147,53.718344,54.207339,54.709637,55.126634,55.611354,56.080056,56.591968,57.095853,\
57.626141,58.113561,58.652142,59.160064,59.692249,60.176723,60.637936,61.133861,61.63295,\
62.233265,62.771265,63.279196,63.857212,64.372653,64.913312,65.424398,65.922089,66.394987,\
66.945661,67.509747,68.038309,68.604401,69.13229,69.602302,70.107945,70.725428,71.23882,\
71.777114,72.296226,72.773812,73.320654,73.877359,74.364006,74.922628,75.45537,75.986566,\
76.488407,76.992126,77.537483,78.074323,78.522398,79.155226,79.700755,80.24615,80.774027,\
81.281622,81.849596,82.379127,82.891282,83.400572,83.956235,84.421416,84.999601,85.587011,\
86.102233,86.55735,87.125044,87.610685,88.176379,88.69512,89.244613,89.747139,90.301469,\
90.862197,91.351708,91.869362,92.43227,92.922215,93.434448,93.977714,94.49139,94.983863,\
95.540886,95.983855,96.456018,96.887049,97.340082,97.777008,98.263028,98.759082,99.290763,\
99.801203,100.257057,100.685845,101.164965,101.648238,102.069076,102.535956,103.024362,\
103.513322,103.969961,104.40931,104.857255,105.332732,105.790398,106.245744,106.698519,\
107.161546,107.665781,108.132922,108.626046,109.100312,109.578414,109.998263,110.44991,\
110.949777,111.402529,111.848302,112.337396,112.819653,113.272686,113.763024,114.294687,\
114.827706,115.314713,115.73476,116.270515,116.760326,117.231211,117.722508,118.185972,\
118.69774,119.17197,119.702988,120.213051,120.745105,121.259355,121.743443,122.269437,\
122.700357,123.221884,123.779168,124.260909,124.717295,125.256697,125.736147]