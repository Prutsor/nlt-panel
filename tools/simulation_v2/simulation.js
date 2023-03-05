const button_debug = document.getElementById('button_debug');
const button_connect = document.getElementById('button_connect');
const button_time = document.getElementById('button_time');

// @version 2.2.0

const MAJOR = 2;
const MINOR = 2;
const PATCH = 0;

document.getElementById(
	'info_version_software'
).innerText = `${MAJOR}.${MINOR}.${PATCH}`;

const toggle_menu = (element) => {
	element.parentElement.classList.toggle('bordered');
};

const menu_load = (element) => {
	element.querySelector('.indicator').classList.remove('hidden');
};

const menu_load_finish = (element) => {
	element.querySelector('.indicator').classList.add('hidden');
};

const { autoDetect } = require('@serialport/bindings-cpp');
const binding = autoDetect();

const {
	SimpleSerialProtocol,
	WriteCommandConfig,
	ReadCommandConfig,
} = require('../../lib/simple-serial-protocol-node/dist');

button_connect.onclick = async (event) => {
	if (button_connect.parentElement.classList.contains('bordered')) {
		if (window.arduino) {
			if (button_debug.parentElement.classList.contains('bordered'))
				button_debug.click();

			window.arduino
				.dispose()
				.then(() => {
					console.log('disconnected');
				})
				.catch((err) => {
					console.log('could not disconnect', err);
				})
				.finally(() => {
					delete window.arduino;
					event.preventDefault();
					window.renderer.reset();
				});
		}

		return toggle_menu(button_connect);
	}

	menu_load(button_connect);

	const ports = await binding.list();

	console.log(ports);

	document.getElementById('port-list').innerHTML = ports
		.map((port) => {
			const is_arduino =
				port.manufacturer.includes('Arduino') ||
				port.friendlyName.includes('Arduino');

			// prettier-ignore
			return `
                <li ${is_arduino ? 'class="bordered"' : ''}>
                    <label for="select-modal" class="port-${port.path} flex flex-col gap-0">
                        <p class="text-left font-bold text-base w-full">${port.friendlyName}</p>
                        <p class="text-left font-semibold text-sm w-full">${port.path} &#x2022 ${port.manufacturer}</p>
                    </label>
                </li>
            `;
		})
		.join('');

	for (const port of ports) {
		document
			.getElementById('port-list')
			.querySelector(`.port-${port.path}`).onclick = async () => {
			menu_load(button_connect);

			window.arduino = new SimpleSerialProtocol(port.path, 115200);

			const arduino = window.arduino;

			if (arduino.registeredCommands.size == 0) {
				arduino.registerCommand(
					new ReadCommandConfig('c', window.renderer.setPixel)
						.addUInt8Param()
						.addUInt8Param()
						.addUInt8Param()
						.addUInt8Param()
				);

				arduino.registerCommand(
					new ReadCommandConfig('f', (fps) => {
						if (window.debug)
							document.getElementById('fps').innerText = `${fps} fps`;
					}).addUInt16Param()
				);

				arduino.registerCommand(
					new ReadCommandConfig('r', (major, minor, patch) => {
						document.getElementById(
							'info_version_arduino'
						).innerText = `${major}.${minor}.${patch}`;
					})
						.addUInt8Param()
						.addUInt8Param()
						.addUInt8Param()
				);
			}

			arduino
				.init(2000)
				.catch((err) => {
					toggle_menu(button_connect);

					console.error('Could not init connection. reason:', err);
				})
				.then(() => {
					console.log('Arduino connected.');

					button_debug.onclick = () => {
						menu_load(button_debug);
						toggle_menu(button_debug);

						window.renderer.reset();

						window.debug =
							button_debug.parentElement.classList.contains('bordered');

						document.getElementById('info_debug').innerText = window.debug;

						arduino.writeCommand(
							new WriteCommandConfig('d').addBooleanValue(window.debug)
						);

						menu_load_finish(button_debug);
					};

					button_time.onclick = () => {
						const date = new Date(Date.now());

						arduino.writeCommand(
							new WriteCommandConfig('t')
								.addUInt8Value(date.getSeconds())
								.addUInt8Value(date.getMinutes())
								.addUInt8Value(date.getHours())
								.addUInt8Value(date.getDay())
								.addUInt8Value(date.getDate())
								.addUInt8Value(date.getMonth())
								.addUInt8Value(date.getFullYear() - 2000)
						);
					};

					arduino.writeCommand(
						new WriteCommandConfig('r')
							.addUInt8Value(MAJOR)
							.addUInt8Value(MINOR)
							.addUInt8Value(PATCH)
					);
				})
				.finally(() => {
					toggle_menu(button_connect);
					menu_load_finish(button_connect);
				});
		};
	}

	menu_load_finish(button_connect);
};
