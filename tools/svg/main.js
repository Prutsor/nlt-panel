window.ready = false;

const matrix_position = (path) => {
	path = path.getBBox();

	return [path.x + path.width / 2, path.y + path.height / 2];
};

const matrix_distance = (path, other_path) => {
	return math.distance(path, other_path);
};

function hsv2rgb(h, s, v) {
	let f = (n, k = (n + h / 60) % 6) =>
		v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
	return [f(5) * 255, f(3) * 255, f(1) * 255];
}

const line_position = (line) => {
	line = line.getBBox();

	return [line.x + line.width / 2, line.y + line.height / 2];
};

const line_distance = (line, other_line) => {
	return math.distance(line, other_line);
};

const line_size = (line) => {
	x1 = line.getAttribute('x1');
	x2 = line.getAttribute('x2');

	y1 = line.getAttribute('y1');
	y2 = line.getAttribute('y2');

	return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const scale_group = (group, scale_group) => {
	let centerX = 0;
	let centerY = 0;

	for (let element of group) {
		element = element.getBBox();

		centerX += element.x + element.width / 2;
		centerY += element.y + element.height / 2;
	}

	centerX = centerX / group.length;
	centerY = centerY / group.length;

	const scale = window.settings.scale.multiplier;

	for (const element of group) {
		SVG(element).scale(scale, scale, centerX, centerY);
	}
};

const path_to_lines = (index, path) => {
	const d = path.getAttribute('d').split(' ');

	let lines = [];

	let last_command;
	for (let command of d) {
		let close = false;
		command = command
			.replace('M', '')
			.replace('L', '')
			.split(',')
			.map((x) => {
				close = x.includes('z');

				return parseFloat(x.replace('z', ''));
			});

		command[0] += window.viewBox[2] / 2;
		command[1] += window.viewBox[3] / 2;

		if (last_command) {
			const line = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'line'
			);
			line.setAttribute('x1', last_command[0]);
			line.setAttribute('x2', command[0]);
			line.setAttribute('y1', last_command[1]);
			line.setAttribute('y2', command[1]);

			lines.push(line);
		}

		last_command = command;
	}

	if (index == 0) {
		for (const line of lines) {
			line.setAttribute('stroke', window.settings.colors.border);
		}
	}

	return lines;
};

const neighbour_sort = (points) => {
	const points_ = [];

	for (let index = 0; index < points.length; index++) {
		if (index == 0) {
			points_.push(points[0]);
		} else {
			const point = points_[points_.length - 1];

			points_.push(
				points
					.sort((a, b) => {
						return math.distance(point, a) - math.distance(point, b);
					})
					.find((other_point) => {
						return !points_.includes(other_point);
					})
			);
		}
	}

	return points_;
};

Array.prototype.equals = function (array) {
	// if the other array is a falsy value, return
	if (!array) return false;
	// if the argument is the same array, we can be sure the contents are same as well
	if (array === this) return true;
	// compare lengths - can save a lot of time
	if (this.length != array.length) return false;

	for (var i = 0, l = this.length; i < l; i++) {
		// Check if we have nested arrays
		if (this[i] instanceof Array && array[i] instanceof Array) {
			// recurse into the nested arrays
			if (!this[i].equals(array[i])) return false;
		} else if (this[i] != array[i]) {
			// Warning - two different object instances will never be equal: {x:20} != {x:20}
			return false;
		}
	}
	return true;
};

const filter_duplicates = (points) => {
	let ret = [];

	for (const point of points) {
		let found = points.some((other_point) => {
			if (point !== other_point) {
				if (matrix_distance(point, other_point) < 0.1) return true;
			}
		});

		if (!found) {
			ret.push(point);
		}
	}

	return ret;
};

const array_center = (array) => {
	let centerX = 0;
	let centerY = 0;

	for (const position of array) {
		centerX += position[0];
		centerY += position[1];
	}

	centerX = centerX / array.length;
	centerY = centerY / array.length;

	return [centerX, centerY];
};

function sort_by_x(pointset) {
	return pointset.sort(function (a, b) {
		return a[0] - b[0] || a[1] - b[1];
	});
}

window.update = () => {
	if (!window.ready) return;

	console.clear();
	console.time('draw');

	const performance = window.performance.now();

	const element = document.getElementById('content');
	element.innerHTML = window.svg_raw;

	window.svg = element.querySelector('svg');
	window.svg_paths = Array.from(window.svg.children).filter((e) => {
		return e.tagName == 'path';
	});

	const svg = element.querySelector('svg');
	window.viewBox = svg
		.getAttribute('viewBox')
		.split(' ')
		.map((p) => {
			return parseFloat(p);
		});

	window.viewBoxCenter = [window.viewBox[2] / 2, window.viewBox[3] / 2];

	svg.setAttribute('fill', window.settings.colors.background);
	svg.setAttribute('stroke', window.settings.colors.lines);

	svg.setAttribute('stroke-linecap', window.settings.strokes.linecap);

	if (window.settings.scale.enabled) {
		svg.setAttribute(
			'stroke-width',
			`${window.settings.strokes.width / window.settings.scale.multiplier}mm`
		);
	} else {
		svg.setAttribute('stroke-width', `${window.settings.strokes.width}mm`);
	}

	console.timeEnd('draw');
	console.time('line');

	let groups = [];

	if (window.settings.groups.strategy == 'path') {
		console.time('group (path)');

		for (const [index, path] of Object.entries(window.svg_paths)) {
			if (index > 0) {
				const points = path.getAttribute('d').split(' ');

				if (points.length == 7) {
					const p1 = line_position(path);

					const group = groups.find((group) => {
						return group.some((other_path) => {
							const p2 = line_position(other_path);

							return line_distance(p1, p2) <= window.settings.groups.radius;
						});
					});

					if (group) {
						group.push(path);
					} else {
						groups.push([path]);
					}
				} else if (points.length == 5) {
					path.remove();

					for (line of path_to_lines(0, path)) {
						window.svg.appendChild(line);
					}
				}
			} else {
				path.remove();

				if (window.settings.designs.strategy != 'borderless') {
					for (line of path_to_lines(0, path)) {
						window.svg.appendChild(line);
					}
				}
			}
		}

		const groups_ = [];
		const paths = [];

		if (window.settings.designs.strategy == 'borderless') {
			let points = [];

			for (const group of groups) {
				for (const path of group) {
					const point = matrix_position(path);

					point[0] = point[0] + window.viewBox[2] / 2;
					point[1] = point[1] + window.viewBox[3] / 2;

					points.push(point);
				}
			}

			points = hull(points, window.settings.designs.concavity);

			for (const group of groups) {
				for (const path of group) {
					const point = matrix_position(path);

					point[0] = point[0] + window.viewBox[2] / 2;
					point[1] = point[1] + window.viewBox[3] / 2;

					if (points.some((other_point) => point.equals(other_point))) {
						paths.push(path);
					}
				}
			}
		}

		let points__ = [];

		for (const group of groups) {
			let group_ = [];
			let lines_ = [];
			let points_ = [];

			for (const path of group) {
				let lines = path_to_lines(1, path);

				if (window.settings.designs.strategy == 'borderless') {
					if (paths.includes(path)) {
						const large_lines = lines.filter((line) => {
							return line_size(line) >= 0.25;
						});

						large_lines.sort((line, other_line) => {
							return line_size(line) - line_size(other_line);
						});

						let points = [];

						for (const line of large_lines.slice(0, 2)) {
							lines_.push(line);

							points.push([
								parseFloat(line.getAttribute('x1')),
								parseFloat(line.getAttribute('y1')),
							]);
							points.push([
								parseFloat(line.getAttribute('x2')),
								parseFloat(line.getAttribute('y2')),
							]);
						}

						points_.push(...filter_duplicates(points));
					}
				}

				group_.push(...lines);
				path.remove();
			}

			if (window.settings.designs.strategy == 'borderless') {
				const center = array_center(points_);

				points_ = points_.sort((point, other_point) => {
					return (
						math.distance(other_point, center) - math.distance(point, center)
					);
				});

				points__.push(...points_.slice(0, 2));
			}

			for (const line of group_) {
				if (!lines_.includes(line)) {
					window.svg.appendChild(line);
				}
			}

			groups_.push(group_);
		}

		if (window.settings.designs.strategy == 'borderless') {
			let last_point;

			points__ = neighbour_sort(points__);

			for (const point of points__) {
				if (!last_point) {
					last_point = points__.at(-1);
				}

				const line = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'line'
				);
				line.setAttribute('x1', last_point[0]);
				line.setAttribute('x2', point[0]);
				line.setAttribute('y1', last_point[1]);
				line.setAttribute('y2', point[1]);

				if (line_size(line) > 0.5) {
					line.setAttribute('fill', window.settings.colors.border);
					line.setAttribute('stroke', window.settings.colors.border);

					window.svg.appendChild(line);
				} else {
					line.remove();
				}

				last_point = point;
			}
		}

		groups = groups_;

		console.timeEnd('group (path)');
	}

	if (window.settings.groups.strategy == 'line') {
		console.time('group (line)');

		for (const [index, path] of Object.entries(window.svg_paths)) {
			for (const line of path_to_lines(index, path)) {
				window.svg.appendChild(line);
			}

			path.remove();
		}

		window.svg_lines = Array.from(window.svg.children).filter((e) => {
			return e.tagName == 'line';
		});

		for (const [index, line] of Object.entries(window.svg_lines)) {
			const p1 = line_position(line);

			if (index > 3) {
				if (line) {
					const group = groups.find((group) => {
						return group.some((other_line) => {
							const p2 = line_position(other_line);

							return line_distance(p1, p2) <= window.settings.groups.radius;
						});
					});

					if (group) {
						group.push(line);
					} else {
						groups.push([line]);
					}
				}
			}
		}

		console.timeEnd('group (line)');
	}

	console.time('duplicates');

	for (const group of groups) {
		let color = [0, 0, 0];

		if (window.settings.groups.debug)
			color = hsv2rgb(Math.random() * 360, 1, 1);

		for (const line of group) {
			if (window.settings.groups.debug)
				line.setAttribute(
					'stroke',
					`rgb(${color[0]}, ${color[1]}, ${color[2]})`
				);

			if (window.settings.lines.remove_duplicates) {
				const p1 = line_position(line);

				for (const other_line of group) {
					const p2 = line_position(other_line);

					if (line != other_line && other_line && line) {
						if (
							line_distance(p1, p2) < window.settings.lines.duplicate_threshold
						) {
							line.remove();
							other_line.remove();
						}
					}
				}
			}
		}
	}

	console.timeEnd('duplicates');
	console.time('scale');

	for (const group of groups) {
		if (window.settings.scale.enabled) {
			scale_group(group);
		}
	}

	console.timeEnd('scale');

	document.getElementById('file_size').innerText = `${filesize(
		window.svg_raw.length
	)} > ${filesize(document.getElementById('content').innerHTML.length)}`;

	document.getElementById('update_performance').innerText = `${(
		window.performance.now() - performance
	).toFixed(2)}ms`;
};

const benchmark = () => {
	const size = 50;
	let total = 0;

	for (let index = 0; index < size; index++) {
		const start = window.performance.now();
		window.update();
		total += window.performance.now() - start;
	}

	document.getElementById('benchmark').value = `benchmark: ${(
		total / size
	).toFixed(2)} ms`;
};

const run = async () => {
	const file = await fetch('test/test.svg');

	window.svg_raw = await file.text();

	const preview_category = create_settings_category('preview');
	create_setting(preview_category, 'checkbox', 'auto_update', {
		checked: true,
	});

	const design_category = create_settings_category('designs');
	create_setting(design_category, 'select', 'strategy', {
		choices: ['normal', 'borderless'],
		selectedIndex: 1,
	});
	create_setting(design_category, 'checkbox', 'debug', { checked: true });
	create_setting(design_category, 'range', 'concavity', {
		min: 1,
		max: 2,
		step: 0.01,
		value: 1.72,
	});

	const group_category = create_settings_category('groups');
	create_setting(group_category, 'checkbox', 'debug', { checked: false });
	create_setting(group_category, 'select', 'strategy', {
		choices: ['path', 'line'],
		selectedIndex: 0,
	});
	create_setting(group_category, 'range', 'radius', {
		min: 0,
		max: 5,
		step: 0.1,
		value: 1,
	});

	const line_category = create_settings_category('lines');
	create_setting(line_category, 'checkbox', 'remove_duplicates', {
		checked: true,
	});
	create_setting(line_category, 'range', 'duplicate_threshold', {
		min: 0,
		max: 0.2,
		step: 0.01,
		value: 0.05,
	});

	const stroke_category = create_settings_category('strokes');
	create_setting(stroke_category, 'select', 'linecap', {
		choices: ['butt', 'round', 'square'],
		selectedIndex: 1,
	});
	create_setting(stroke_category, 'range', 'width', {
		min: 0,
		max: 0.1,
		step: 0.01,
		value: 0.01,
	});

	const color_category = create_settings_category('colors');
	create_setting(color_category, 'color', 'background', { value: '#ffffff' });
	create_setting(color_category, 'color', 'border', { value: '#0000ff' });
	create_setting(color_category, 'color', 'lines', { value: '#ff0000' });
	create_setting(color_category, 'color', 'test', { value: '#000000' });

	const scale_category = create_settings_category('scale');
	create_setting(scale_category, 'checkbox', 'enabled', { checked: false });
	create_setting(scale_category, 'range', 'multiplier', {
		min: 0.5,
		max: 2,
		step: 0.05,
		value: 1,
	});

	window.ready = true;

	window.update();
};

function pad(d) {
	return d < 10 ? '0' + d.toString() : d.toString();
}

const download = () => {
	const date = new Date();
	const filename =
		date.toLocaleDateString().split('-').reverse().map(pad).join('') +
		date.toLocaleTimeString().split(':').join('') +
		'.svg';

	const element = document.createElement('a');
	element.setAttribute(
		'href',
		'data:text/plain;charset=utf-8,' +
			encodeURIComponent(document.getElementById('content').innerHTML)
	);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
};

const file_input = document.getElementById('file');

file_input.addEventListener('change', () => {
	const reader = new FileReader();
	reader.readAsText(file_input.files[0], 'utf-8');

	reader.onload = (event) => {
		window.svg_raw = event.target.result;

		window.update();
	};
});

run();
