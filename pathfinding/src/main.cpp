#include <iostream>
#include <vector>
#include <time.h>

#include "lib/map.hpp"

#define DEBUG 1
#define RENDER_BMP 1

using namespace std;

typedef struct dynamic_object {
	int x, y, r;
} dynamic_object;

void command_add_dynamic(string& command, MAP &map) {
	vector<dynamic_object> objs;
	command = command.substr(2);
	while (command.find(';') != string::npos) {
		dynamic_object obj;
		sscanf(command.c_str(), "%i;%i;%i", &obj.x, &obj.y, &obj.r);
		objs.push_back(obj);
		command = command.substr(command.find(';')+1);
		command = command.substr(command.find(';')+1);
		command = command.substr(command.find(';')+1);
#if DEBUG
		cerr << "Object : " << obj.x << ":" << obj.y << ":" << obj.r << endl;
#endif
	}
	map.clear_dynamic_barriers();
	for (auto &obj: objs) {
		map.add_dynamic_circle(obj.x, obj.y, obj.r);
	}
}

string command_calc_path(string& command, MAP &map) {
	int x_s, y_s, x_e, y_e;
	vertex_descriptor start, end, start_valid, end_valid;
	vector<vertex_descriptor> path;
	double distance;
	stringstream answer;

	command = command.substr(2);
	sscanf(command.c_str(), "%i;%i;%i;%i", &x_s, &y_s, &x_e, &y_e);
	end = map.get_vertex(x_e, y_e);
	if (map.has_dynamic_barrier(end)) return "\n";
	end_valid = map.find_nearest_valid(end);
	start = map.get_vertex(x_s, y_s);
	start_valid = map.find_nearest_valid(start);
#if DEBUG
	cerr << "Start : " << start_valid[0] << ":" << start_valid[1] << endl;
	cerr << "End : " << end_valid[0] << ":" << end_valid[1] << endl;
	clock_t t = clock();
#endif
	map.solve(start_valid, end_valid);
	map.solve_smooth();
	path = map.get_smooth_solution();
	distance = map.get_smooth_solution_length();
	if (start != start_valid) {
		path.insert(path.begin(), start);
		distance += euclidean_heuristic(start)(start_valid);
	}
	if (end != end_valid) {
		path.push_back(end);
		distance += euclidean_heuristic(end)(end_valid);
	}
	for (auto &point: path) {
		answer << point[0] << ";" << point[1] << ";";
	}
	answer << distance << endl;
#if DEBUG
	cerr << "Path contains " << path.size() << " points, total distance = " << distance << endl;
	cerr << "Computing time : " << double(clock() - t)/CLOCKS_PER_SEC << endl;
#if RENDER_BMP
	map.generate_bmp("tmp.bmp");
#endif
#endif
	return answer.str();
}

int main(int argc, char **argv) {
	if (argc < 2) {
		cerr << "$0 map.bmp" << endl;
	} 

	heuristic_type mode = NORM1;
	if (argc >= 3) {
		switch(argv[2][0]) {
			case 'e':
			mode = EUCLIDEAN;
			break;
			case 'n':
			mode = NORM1;
			break;
		}
	}

#if DEBUG
	cerr << "Loading map " << argv[1] << endl;
#endif
	string path = string(argv[1]);
	MAP map(path);
	map.set_heuristic_mode(mode);
#if DEBUG
	cerr << "Done, map size is : " << map.get_map_w() 
			<< "x" << map.get_map_h() << endl;
#endif
	while (1) {
		string command, answer;
		cin >> command;
		switch (command[0]) {
			case 'D':
			command_add_dynamic(command, map);
			break;
			case 'C':
			answer = command_calc_path(command, map);
			cout << answer;
			cout.flush();
			break;
		}
	}
}