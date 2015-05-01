#include "map.hpp"

using namespace std;

MAP::MAP(const std::string &map_filename):
	image(map_filename) {
	
	map_h = image.height();
	map_w = image.width();

	map = new grid(create_map(map_w, map_h));
	map_barrier = new filtered_grid(create_barrier_map());

	for (int y=0; y < map_h; y++) {
		for (int x=0; x < map_w; x++) {
			unsigned char r, g, b;
			image.get_pixel(x, y, r, g, b);
			if (b < 127) {
				vertex_descriptor u = get_vertex(x, y);
				static_barriers.insert(u);
			}
		}
	}

	barriers = static_barriers;
}

MAP::~MAP() {
	delete map;
	delete map_barrier;
}

void MAP::add_dynamic_circle(int x, int y, float f_r) {
	int r = ceil(f_r);
	int r2 = pow(r, 2);
	for (int p_x=x-r; p_x <= x+r; p_x++) {
		if (p_x < 0 || p_x >= length(0)) {
			continue;
		}
		int y_length = ceil(sqrt(r2 - pow(x-p_x,2))); 
		for (int p_y=y-y_length; p_y <= y+y_length; p_y++) {
			if (p_y < 0 || p_y >= length(1)) {
				continue;
			}
			vertex_descriptor u = get_vertex(p_x, p_y);
			if (!has_barrier(u)) {
				dynamic_barriers.insert(u);
				barriers.insert(u);
			}
		}
	}
	clear_solution();
}

void MAP::clean_dynamic_barriers() {
	dynamic_barriers.clear();
	barriers = static_barriers;
	clear_solution();
}

bool MAP::solve(int x_source, int y_source, int x_dest, int y_dest, heuristic_type mode) {
	clear_solution();
	boost::static_property_map<double> weight(1);
	// The predecessor map is a vertex-to-vertex mapping.
	typedef boost::unordered_map<vertex_descriptor,
								vertex_descriptor,
								vertex_hash> pred_map;
	pred_map predecessor;
	boost::associative_property_map<pred_map> pred_pmap(predecessor);
	// The distance map is a vertex-to-distance mapping.
	typedef boost::unordered_map<vertex_descriptor,
							   double,
							   vertex_hash> dist_map;
	dist_map distance;
	boost::associative_property_map<dist_map> dist_pmap(distance);

	v_start = get_vertex(x_source, y_source);
	v_end = get_vertex(x_dest, y_dest);

	astar_goal_visitor visitor(v_end);

	try {
	if (mode == NORM1) {
		norm1_heuristic heuristic(v_end);
		astar_search(*map_barrier, v_start, heuristic,
					 boost::weight_map(weight).
					 predecessor_map(pred_pmap).
					 distance_map(dist_pmap).
					 visitor(visitor) );
	} else if (mode == EUCLIDEAN) {
		euclidean_heuristic heuristic(v_end);
		astar_search(*map_barrier, v_start, heuristic,
					 boost::weight_map(weight).
					 predecessor_map(pred_pmap).
					 distance_map(dist_pmap).
					 visitor(visitor) );
	}
	} catch(found_goal fg) {
	// Walk backwards from the goal through the predecessor chain adding
	// vertices to the solution path.
	for (vertex_descriptor u = v_end; u != v_start; u = predecessor[u])
		solution.push_back(u);
	solution.push_back(v_start);
	solution_length = distance[v_end];
	return true;
	}
	return false;
}

void MAP::solve_smooth() {
	if (!solved()) return;
	double distance;
	vertex_descriptor last = v_start;
	smooth_solution_length = 0;
	smooth_solution.push_back(v_start);
	// solution.begin is the last vertex in the path
	do {
		for (auto it=solution.begin(); *it!=last; ++it) {
			if (get_direct_distance(last, *it, distance)) {
				smooth_solution.push_back(*it);
				smooth_solution_length += distance;
				last = *it;
				break;
			}
		}
	} while (last != v_end);
}

void MAP::generate_bmp(string path) {
	bitmap_image img(length(0), length(1));
	for (int y = 0; y < length(1); y++) {
		for (vertices_size_type x = 0; x < length(0); x++) {
			vertex_descriptor u = {{x, vertices_size_type(y)}};
			if (smooth_solution_contains(u))
				img.set_pixel(x, y, 255, 0, 0);
			else if (solution_contains(u))
				img.set_pixel(x, y, 0, 255, 0);
			else if (has_barrier(u))
				img.set_pixel(x, y, 0, 0, 0);
			else
				img.set_pixel(x, y, 255, 255, 255);
		}
	}
	img.save_image(path);
}

/* 			*
 *  PRIVATE *
 * 			*/

bool MAP::get_direct_distance(vertex_descriptor& v, vertex_descriptor& goal, double &d) {
	double dx, dy, m, c;
	dx = goal[0] - v[0];
	dy = goal[1] - v[1];
	m = dy / dx;
	c = v[1] - m*v[0];
	for (int x=v[0]; x<goal[0]; x++) {
		int y = round(m*x+c);
		if (has_barrier(get_vertex(x, y))) {
			d = 0;
			return false;
		}
	}
	d = euclidean_heuristic(goal)(v);
	return true;
}

vertex_descriptor MAP::get_vertex(int x, int y) {
	return vertex(x+(y*map_w), *map);
}

grid MAP::create_map(std::size_t x, std::size_t y) {
	boost::array<std::size_t, 2> lengths = { {x, y} };
	return grid(lengths);
}

filtered_grid MAP::create_barrier_map() {
	return boost::make_vertex_subset_complement_filter(*map, barriers);
}

#define BARRIER "#"
// Print the maze as an ASCII map.
std::ostream& operator<<(std::ostream& output, const MAP& m) {
	output << "Grid size : " << m.length(0) << "x" <<  m.length(1) << std::endl;
	// Header
	for (vertices_size_type i = 0; i < m.length(0)+2; i++)
		output << BARRIER;
	output << std::endl;
	// Body
	for (int y = 0; y < m.length(1); y++) {
		// Enumerate rows in reverse order and columns in regular order so that
		// (0,0) appears in the lower left-hand corner.  This requires that y be
		// int and not the unsigned vertices_size_type because the loop exit
		// condition is y==-1.
		for (vertices_size_type x = 0; x < m.length(0); x++) {
			// Put a barrier on the left-hand side.
			if (x == 0)
				output << BARRIER;
			// Put the character representing this point in the maze grid.
			vertex_descriptor u = {{x, vertices_size_type(y)}};
			if (m.smooth_solution_contains(u))
				output << "O";
			else if (m.solution_contains(u))
				output << ".";
			else if (m.has_barrier(u))
				output << BARRIER;
			else
				output << " ";
			// Put a barrier on the right-hand side.
			if (x == m.length(0)-1)
				output << BARRIER;
		}
		// Put a newline after every row except the last one.
		output << std::endl;
	}
	// Footer
	for (vertices_size_type i = -1; i < m.length(0)+2; i++)
		output << BARRIER;
	return output;
}
