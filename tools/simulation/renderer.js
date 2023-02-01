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

const color_blend = require('color-blend');

window.selectArduino = async () => {
	const ports = await SerialPort.list();
	const port = ports.find((port) => {
		return (
			port.manufacturer.includes('Arduino') ||
			port.friendlyName.includes('Arduino')
		);
	});

	window.serial = new SerialPort(
		{
			path: port.path,
			baudRate: 921600,
			dataBits: 8,
			stopBits: 1,
		},
		(err) => {
			if (err) console.log(err);

			if (!err) console.log('connected to', port.path);
		}
	);

	const parser = window.serial.pipe(new DelimiterParser({ delimiter: '\r\n' }));

	parser.on('data', (data) => {
		data = data.toString();
		data = data.split(',');

		const command = data.shift();

		if (command == 'c') {
			const index = data.shift();
			const color = color_blend.overlay(window.default_color, {
				r: parseFloat(data[0]),
				g: parseFloat(data[1]),
				b: parseFloat(data[2]),
				a: 0.9,
			});

			const hexagon = hexagons[index];

			if (hexagon) {
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
		} else if (command == 'f') {
			document.getElementById('fps').innerText = `${data.shift()} fps`;
		}
	});
};

window.onbeforeunload = () => {
	if (window.serial !== undefined && window.serial.isOpen == true) {
		window.serial.close();
	}
};
