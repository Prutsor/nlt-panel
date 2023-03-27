const button_debug = document.getElementById('button_debug');
const button_connect = document.getElementById('button_connect');
const button_time = document.getElementById('button_time');

const version = require('../../package.json').version.split('.');

// @version x.x.x

const MAJOR = version[0];
const MINOR = version[1];
const PATCH = version[2];

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

window.devices = {};

const bonjour = require('bonjour')();

const browser = bonjour.find({ type: 'nlt-panel', protocol: 'tcp' });

browser.on('up', (service) => {
	window.devices[service.referer.address] = {
		ip: service.referer.address,
		port: service.port,
		name: service.name,
		version: service.txt.version,
	};

	document.getElementById('port-list').innerHTML = Object.keys(window.devices)
		.map((ip) => {
			const device = window.devices[ip];

			// prettier-ignore
			return `
			<li>
				<label for="select-modal" onclick="select_device('${device.ip}')" class="flex flex-col gap-0">
					<p class="text-left font-bold text-base w-full flex">${device.name}</p>
					<p class="text-left font-semibold text-sm w-full">${device.version} &#x2022 ${device.ip}</p>
				</label>
			</li>
		`;
		})
		.join('');
});

// TODO: WEATHER: http://ip-api.com/line/?fields=lat,lon
// https://openweathermap.org/weather-conditions
// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
// https://api.openweathermap.org/data/2.5/weather?lat=52.3831&lon=4.7472&appid=c10386b95af169db0c15d11aa0170def
// https://api.openweathermap.org/data/2.5/weather?lat=52.3831&lon=4.7472&appid=c10386b95af169db0c15d11aa0170def&units=metric

// // You can specify the time server pool and the offset (in seconds, can be
// // changed later with setTimeOffset() ). Additionally you can specify the
// // update interval (in milliseconds, can be changed using setUpdateInterval() ).
// NTPClient timeClient(ntpUDP, "europe.pool.ntp.org", 3600, 60000);

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

	client.connect(device.port, device.ip, () => {
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
