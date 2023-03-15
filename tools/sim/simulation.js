const button_debug = document.getElementById('button_debug');
const button_connect = document.getElementById('button_connect');
const button_time = document.getElementById('button_time');

// @version 3.0.0

const MAJOR = 3;
const MINOR = 0;
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

const dgram = require('dgram');
const client = dgram.createSocket('udp4', { reuseAddr: true });
const multicast_address = '224.0.1.3';
const multicast_port = 8266;
const ip = require('quick-local-ip').getLocalIP4();

window.devices = {};

client.bind(multicast_port, ip, () => {
	client.setBroadcast(true);
	client.setMulticastTTL(128);
	client.addMembership(multicast_address, ip);

	console.log('connected');
});

window.onclose = () => {
	client.close();
	client.destroy();
};

client.on('message', (data, rinfo) => {
	const id = data.readUInt8(0);

	console.log('device found');

	if (id == 0) {
		const version = [data.readUint8(2), data.readUint8(3), data.readUint8(4)];

		window.devices[rinfo.address] = {
			rssi: data.readUint8(1),
			version: version.join('.'),
			ip: rinfo.address,
		};

		document.getElementById('port-list').innerHTML = Object.keys(window.devices)
			.map((ip) => {
				const device = window.devices[ip];

				// prettier-ignore
				return `
					<li>
						<label for="select-modal" onclick="select_device('${ip}')" class="flex flex-col gap-0">
							<p class="text-left font-bold text-base w-full flex">
								${ip}
								<svg class='ml-auto h-6 w-6' viewBox='0 0 100 100' stroke='currentColor' stroke-width='5' fill='currentColor' stroke-linecap='butt' xmlns="http://www.w3.org/2000/svg">
									${(device.rssi >= 0) ? "<circle id='wifi-0' cx='50' cy='80' r='5' stroke-width='0' />" : ""}

									${(device.rssi >= 20) ? "<path id='wifi-1' d='M 35 70 Q 50 60, 65 70' fill='none' />" : ""}
									${(device.rssi >= 40) ? "<path id='wifi-2' d='M 25 60 Q 50 40, 75 60' fill='none' />" : ""}
									${(device.rssi >= 60) ? "<path id='wifi-3' d='M 15 50 Q 50 20, 85 50' fill='none' />" : ""}
									${(device.rssi >= 80) ? "<path id='wifi-4' d='M 5 40 Q 50 0, 95 40' fill='none' />" : ""}

									<path id='wifi-none' d="M 5 40 Q 50 0, 95 40 L 50 82.5 Z" fill='currentColor' stroke='currentColor' opacity='0.1' />
								</svg>
							</p>
							<p class="text-left font-semibold text-sm w-full">${device.version} &#x2022 ${device.rssi}%</p>
						</label>
					</li>
				`;
			})
			.join('');
	}
});

// TODO: WEATHER: http://ip-api.com/line/?fields=lat,lon
// https://openweathermap.org/weather-conditions

const net = require('net');
let stream_fps = 0;
let stream_fps_display = 0;

setInterval(() => {
	stream_fps_display = stream_fps;
	stream_fps = 0;
}, 1000);

const select_device = (ip) => {
	const device = window.devices[ip];

	menu_load(button_connect);

	document.getElementById('info_version_esp').innerText = device.version;
	document.getElementById('info_ip_esp').innerText = device.ip;

	const client = net.Socket();
	window.client = client;

	client.connect(8265, device.ip, () => {
		toggle_menu(button_connect);
		console.log('Connected to server');

		menu_load_finish(button_connect);
	});

	client.on('data', (data) => {
		const id = data.readUInt8(0);

		if (id == 2) {
			const fps = (data.readUInt8(1) << 8) | data.readUInt8(2);
			document.getElementById(
				'fps'
			).innerText = `${stream_fps_display}/${fps} FPS`;
			document.getElementById('rssi').innerText = `${data.readUInt8(3)}% RSSI`;
		} else if (id == 1) {
			const bufferSize = 385;

			if (data.length % bufferSize == 0) {
				for (let a = 0; a < Math.floor(data.length / bufferSize); a += 1) {
					const buffer = data.slice(a * 385, (a + 1) * 385).slice(1);
					const chunkSize = 3;

					for (let i = 0; i < buffer.length; i += chunkSize) {
						const index = i / chunkSize;
						const chunk = buffer.slice(i, i + chunkSize);

						window.renderer.setPixel(
							index,
							chunk.readUInt8(0),
							chunk.readUInt8(1),
							chunk.readUInt8(2)
						);
					}
				}

				stream_fps++;
			} else {
				console.log('received corrupt packet', data);

				data = Buffer.alloc(0);
			}
		}
	});

	client.on('close', () => {
		console.log('Connection closed');
	});
};

button_connect.onclick = () => {
	if (button_connect.parentElement.classList.contains('bordered')) {
		event.preventDefault();

		window.client.destroy();
		delete window.client;

		toggle_menu(button_connect);
	}
};
