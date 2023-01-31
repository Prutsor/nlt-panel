const width = 7;
const height = 20;

const pixels = 128;

generate_grid(width, height);

const set_color = (index, r, g, b) => {
	window.grid[index].style.setProperty(
		'--led-color',
		'rgb(' + r + ',' + g + ',' + b + ')'
	);
};

function hsl2rgb(h, s, l) {
	let a = s * Math.min(l, 1 - l);
	let f = (n, k = (n + h / 30) % 12) =>
		l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	return [f(0) * 255, f(8) * 255, f(4) * 255];
}

const digits = [
	[1, 2, 3, 5, 8, 10, 11, 12],
	[2, 5, 7, 10, 12],
	[1, 2, 5, 7, 6, 8, 11, 12],
	[1, 2, 5, 7, 6, 10, 12, 10, 11],
	[1, 3, 6, 7, 5, 10, 12],
	[1, 2, 3, 6, 7, 10, 11, 12],
	[2, 4, 6, 7, 8, 11, 12, 10],
	[1, 2, 5, 7, 9, 11],
	[1, 2, 3, 5, 6, 7, 8, 10, 11, 12],
	[1, 2, 3, 5, 6, 7, 9, 11],
];

const digit_rows = {
	1: [1, 0],
	2: [1, 1],
	3: [2, 0],
	4: [2, 1],
	5: [2, 2],
	6: [3, 0],
	7: [3, 1],
	8: [4, 0],
	9: [4, 1],
	10: [4, 2],
	11: [5, 0],
	12: [5, 1],
};

/*
0
34
36
72
75
110
111
*/

const rows = {
	0: 0,
	1: 33,
	2: 36,
	3: 71,
	4: 75,
	5: 109,
	6: 111,
};

let TEST_color = [255, 0, 0];

const render_digit = (offset, digit, color) => {
	for (const pixel of digit) {
		const row = digit_rows[pixel][0];
		const index = digit_rows[pixel][1];

		if (row % 2 == 0) {
			set_color(rows[row] + index + offset, ...color);
		} else {
			set_color(rows[row] - index - offset, ...color);
		}
	}
};

const digit_test = () => {
	let number = 0;

	setInterval(() => {
		number = (number + 1) % 10;

		for (let index = 0; index < window.grid.length; index++) {
			set_color(index, 0, 0, 0);
		}

		console.log(number);

		render_digit(0, digits[number], [0, 0, 0]);
		render_digit(4, digits[number], [0, 0, 0]);

		render_digit(10, digits[number], [0, 0, 0]);
		render_digit(14, digits[number], [0, 0, 0]);

		// DOTS
		set_color(44, ...TEST_color);
		set_color(83, ...TEST_color);
	}, 1000);
};

const clock_test = () => {
	let frame = 0;

	setInterval(() => {
		frame = (frame + 1) % 360;
		// TEST_color = hsl2rgb(frame, 1, 0.5)
		TEST_color = [0, 0, 0];
		const digit_color = [0, 255, 0];

		for (let index = 0; index < window.grid.length; index++) {
			set_color(index, ...TEST_color);
		}

		const date = new Date();

		const hours = [Math.floor(date.getHours() / 10), date.getHours() % 10];

		render_digit(0, digits[hours[0]], digit_color);
		render_digit(4, digits[hours[1]], digit_color);

		const minutes = [
			Math.floor(date.getMinutes() / 10),
			date.getMinutes() % 10,
		];

		render_digit(10, digits[minutes[0]], digit_color);
		render_digit(14, digits[minutes[1]], digit_color);

		set_color(44, ...digit_color);
		set_color(83, ...digit_color);
	}, 20);
};

const arduino_test = async () => {
	for (let index = 0; index < window.grid.length; index++) {
		set_color(index, 0, 0, 0);
	}

	const port = await navigator.serial.requestPort();
	await port.open({ baudRate: 115200 });

	const decoder = new TextDecoderStream();

	port.readable.pipeTo(decoder.writable);

	const inputStream = decoder.readable;
	const reader = inputStream.getReader();

	let buffer = '';

	while (true) {
		const { value, done } = await reader.read();

		if (done) {
			console.log('done');
			reader.releaseLock();
			break;
		}

		try {
			buffer += value;

			if (buffer.length > 100) buffer = '';

			if (buffer.includes('\r\n')) {
				const lines = buffer.split('\r\n');
				const line = lines.shift().split(',');

				const command = line.shift();

				if (command == 'c') {
					set_color(line.shift(), ...line.map((l) => parseFloat(l)));
				} else if (command == 'f') {
					const fps = parseFloat(line.shift());

					document.getElementById('fps').innerText = fps + ' fps';
				}

				buffer = lines.join('');
			}
		} catch (e) {
			buffer = '';
		}
	}
};

const update = () => {
	for (let index = 0; index < window.grid.length; index++) {
		set_color(index, 0, 0, 0);
	}

	render_digit(0, digits[0]);
	render_digit(4, digits[1]);

	render_digit(10, digits[2]);
	render_digit(14, digits[3]);

	// DOTS
	set_color(44, ...TEST_color);
	set_color(83, ...TEST_color);
};

// setInterval(() => {
//     update()
// }, 100)

// clock_test()
// digit_test()

arduino_test();
