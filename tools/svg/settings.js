function titleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] =
			splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	// Directly return the joined string
	return splitStr.join(' ');
}

window.settings = {};

const create_settings_category = (id) => {
	const category = document.createElement('div');
	category.classList.add('grid-container');

	const title_element = document.createElement('strong');
	title_element.innerText = titleCase(id);

	category.setAttribute('id', id);
	window.settings[id] = {};

	document.getElementById('categories').appendChild(title_element);
	document.getElementById('categories').appendChild(category);
	document
		.getElementById('categories')
		.appendChild(document.createElement('br'));

	return category;
};

const types = {
	range: {
		options: {
			min: 0,
			max: 100,
			step: 1,
			value: 50,
		},
	},
	checkbox: {
		value: 'checked',
		options: {
			checked: false,
		},
	},
	select: {
		tag: 'select',
		options: {
			selectedIndex: 0,
			choices: ['test1', 'test2'],
		},
		init: (element, options) => {
			for (let choice of options.choices) {
				choice_element = document.createElement('option');
				choice_element.value = choice;
				choice_element.innerText = choice;

				element.appendChild(choice_element);
			}

			// element.setAttribute('selectedIndex', options.selectedIndex);
			element.selectedIndex = options.selectedIndex;
		},
	},
	color: {
		options: {
			value: '#ffffff',
		},
	},
};

function isNumeric(num) {
	return !isNaN(parseFloat(num));
}

const create_setting = (category, type, id, options) => {
	if (types[type]) {
		const holder = document.createElement('div');
		holder.classList.add('grid-item');
		const title = document.createElement('p');

		const tag = types[type].tag ? types[type].tag : 'input';

		const element = document.createElement(tag);
		if (tag == 'input') element.setAttribute('type', type);

		type = types[type];

		options = options ? options : {};
		options = Object.assign(type.options, options);

		if (type.init) {
			type.init(element, options);
		} else {
			for (const [option, value] of Object.entries(type.options)) {
				element[option] = value;
			}
		}

		const value = type.value ? type.value : 'value';

		const update_title = () => {
			title.innerHTML = `${titleCase(id.replace('_', ' '))}: ${element[value]}`;
		};

		const category_id = category.getAttribute('id');

		const update = () => {
			update_title();

			if (isNumeric(element[value])) {
				window.settings[category_id][id] = parseFloat(element[value]);
			} else {
				window.settings[category_id][id] = element[value];
			}

			if (window.ready && window.settings.preview.auto_update) window.update();
		};

		element.oninput = update_title;
		element.onclick = update_title;
		element.addEventListener('change', update);
		update();

		category.appendChild(holder);
		holder.appendChild(title);
		holder.appendChild(element);
	}
};
