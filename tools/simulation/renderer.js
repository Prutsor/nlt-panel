import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const scene = new THREE.Scene();

const width = 1000;
const height = 620;

const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(1000, 620);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

// const mesh = new THREE.Mesh(
// 	new THREE.PlaneGeometry(2000, 2000),
// 	new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
// );
// mesh.receiveShadow = true;
// scene.add(mesh);

// new RGBELoader()
// 	.setPath('environments/')
// 	.load('photo_studio_01_4k.hdr', (texture) => {
// 		texture.mapping = THREE.EquirectangularReflectionMapping;

// 		scene.background = texture;
// 		scene.environment = texture;
// 	});

document.getElementById('content').appendChild(renderer.domElement);

let hexagons = [];
let hexagon_caps = {};

const fbxLoader = new FBXLoader();
fbxLoader.load(
	'models/panel.fbx',
	(object) => {
		object.scale.set(0.01, 0.01, 0.01);

		object.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});

		const box3 = new THREE.Box3().setFromObject(object);
		const vector = new THREE.Vector3();
		box3.getCenter(vector);
		object.position.set(-vector.x, -vector.y, -vector.z);

		const hexagrid = object.children[0].children[0];
		const hexagrid_caps = object.children[1].children[0];

		let rows = [];

		for (let hexagon of hexagrid.children) {
			hexagon = hexagon.children[0].children[0];

			const position = new THREE.Vector3();
			position.setFromMatrixPosition(hexagon.matrixWorld);

			position.y += vector.y * 100;
			position.y = Math.floor(position.y * 4);

			if (!rows[position.y]) rows[position.y] = [];

			rows[position.y].push(hexagon);
		}

		let row_index = 0;

		for (let row of rows) {
			if (row) {
				row_index++;

				row.sort((a, b) => {
					const ap = new THREE.Vector3();
					ap.setFromMatrixPosition(a.matrixWorld);

					const bp = new THREE.Vector3();
					bp.setFromMatrixPosition(b.matrixWorld);

					return ap.distanceTo(bp);
				});

				if (!(row_index % 2 == 0)) {
					row = row.reverse();
				}

				hexagons.push(...row);
			}
		}

		hexagons = hexagons.reverse();

		for (let cap of hexagrid_caps.children) {
			const position = new THREE.Vector3();
			position.setFromMatrixPosition(cap.matrixWorld);

			let hexagons_sorted = [...hexagons].sort((a, b) => {
				const ap = new THREE.Vector3();
				ap.setFromMatrixPosition(a.matrixWorld);

				const bp = new THREE.Vector3();
				bp.setFromMatrixPosition(b.matrixWorld);

				return ap.distanceTo(position) - bp.distanceTo(position);
			});

			const hexagon = hexagons_sorted[0];

			if (hexagon_caps[hexagon.id] == undefined) hexagon_caps[hexagon.id] = [];

			hexagon_caps[hexagon.id].push(...cap.children[0].children);
		}

		const default_color = hexagons[0].material.color;
		window.default_material = hexagons[0].material.clone();

		window.default_color = {
			r: default_color.r * 255,
			g: default_color.g * 255,
			b: default_color.b * 255,
			a: 0.1,
		};

		// for (const [index, hexagon] of Object.entries(hexagons)) {
		// 	const color = new THREE.Color(index / 128, index / 128, index / 128);
		// 	hexagon.material = new THREE.MeshStandardMaterial({
		// 		color: color,
		// 		emissive: color,
		// 		emissiveIntensity: 2,
		// 	});
		// }

		scene.add(object);

		console.log('loaded panel.fbx');
	},
	(xhr) => {
		// console.log(xhr);
	},
	(error) => {
		console.error(error);
	}
);

// const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
// hemiLight.position.set(0, 200, 0);
// scene.add(hemiLight);

const controls = new OrbitControls(camera, renderer.domElement);

// const stats = Stats();
// document.body.appendChild(stats.dom);

function render() {
	requestAnimationFrame(render);

	controls.update();
	renderer.render(scene, camera);
	// stats.update();
}

render();

const electron = require('electron');
const { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');

const {
	SimpleSerialProtocol,
	WriteCommandConfig,
	ReadCommandConfig,
} = require('@yesbotics/simple-serial-protocol-node');

const color_blend = require('color-blend');

window.selectArduino = async () => {
	const ports = await SerialPort.list();
	const port = ports.find((port) => {
		return (
			port.manufacturer.includes('Arduino') ||
			port.friendlyName.includes('Arduino')
		);
	});

	if (window.arduino) location.reload();

	window.arduino = new SimpleSerialProtocol(port.path, 115200);

	window.arduino.registerCommand(
		new ReadCommandConfig('f', (fps) => {
			if (window.debug) document.getElementById('fps').innerText = `${fps} fps`;
		}).addUInt16Param()
	);

	window.arduino.registerCommand(
		new ReadCommandConfig('c', (i, r, g, b) => {
			const hexagon = hexagons[i];

			if (hexagon && window.debug) {
				const color = color_blend.overlay(window.default_color, {
					r,
					b,
					g,
					a: 0.9,
				});

				const material = new THREE.MeshBasicMaterial({
					color: new THREE.Color(color.r / 255, color.g / 255, color.b / 255),
				});

				if (hexagon_caps[hexagon.id] !== undefined) {
					for (const cap of hexagon_caps[hexagon.id]) {
						cap.material = material;
					}
				}

				hexagon.material = material;
			}
		})
			.addUInt8Param()
			.addUInt8Param()
			.addUInt8Param()
			.addUInt8Param()
	);

	window.arduino
		.init(2000)
		.catch((err) => {
			console.error('Could not init connection. reason:', err);
		})
		.then(() => {
			console.log('Arduino connected.');

			window.enableDebug = () => {
				window.debug = true;

				arduino.writeCommand(new WriteCommandConfig('d').addBooleanValue(true));
			};

			window.disableDebug = () => {
				window.debug = false;

				arduino.writeCommand(
					new WriteCommandConfig('d').addBooleanValue(false)
				);

				document.getElementById('fps').innerText = `- fps`;

				for (const hexagon of hexagons) {
					const material = window.default_material;

					if (hexagon_caps[hexagon.id] !== undefined) {
						for (const cap of hexagon_caps[hexagon.id]) {
							cap.material = material;
						}
					}

					hexagon.material = material;
				}
			};

			window.setTime = () => {
				// rtc.set(second, minute, hour, dayOfWeek, dayOfMonth, month, year);

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
		});
};

// window.onbeforeunload = async () => {
// 	try {
// 		if (window.arduino.isOpen()) await window.arduino.dispose();
// 	} catch (e) {
// 		console.log(e);
// 	}
// };
