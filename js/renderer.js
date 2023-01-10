const width = 7
const height = 20

const pixels = 128

generate_grid(width, height)

const set_color = (index, r, g, b) => {
	window.grid[index].style.setProperty('--led-color', 'rgb(' + r + ',' + g + ',' + b + ')');
}

const digits = {
	0: [1, 2, 3, 5, 8, 10, 11, 12],
	1: [2, 5, 7, 10, 12],
	2: [1, 2, 5, 7, 6, 8, 11, 12],
	3: [1, 2, 5, 7, 6, 10, 12, 10, 11],
	4: [1, 3, 6, 7, 5, 10, 12],
	5: [1, 2, 3, 6, 7, 10, 11, 12],
	6: [2, 4, 6, 7, 8, 11, 12, 10],
	7: [1, 2, 5, 7, 9, 11],
	8: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12],
	9: [1, 2, 3, 5, 6, 7, 9, 11],
}

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
	12: [5, 1]
}

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
	6: 111
}

const TEST_color = [255, 0, 0]

const render_digit = (offset, digit) => {
	for (const pixel of digit) {
		const row = digit_rows[pixel][0]
		const index = digit_rows[pixel][1]

		if (row % 2 == 0) {
			set_color(rows[row] + index + offset, ...TEST_color)
		} else {
			set_color(rows[row] - index - offset, ...TEST_color)
		}
	}
}

const digit_test = () => {
	let number = 0

	setInterval(() => {
		number = (number + 1) % 10

		for (let index = 0; index < window.grid.length; index++) {
			set_color(index, 0, 0, 0)
		}

		console.log(number)
	
		render_digit(0, digits[number])
		render_digit(4, digits[number])
	
		render_digit(10, digits[number])
		render_digit(14, digits[number])
	
		// DOTS
		set_color(44, ...TEST_color)
		set_color(83, ...TEST_color)
	}, 1000)
}

const clock_test = () => {
	
}

const update = () => {
    for (let index = 0; index < window.grid.length; index++) {
    	set_color(index, 0, 0, 0)
    }

	render_digit(0, digits[0])
	render_digit(4, digits[1])

	render_digit(10, digits[2])
	render_digit(14, digits[3])

	// DOTS
    set_color(44, ...TEST_color)
    set_color(83, ...TEST_color)
}

// setInterval(() => {
//     update()
// }, 100)