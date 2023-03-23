const width = 1024;
const height = 512;

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	preserveDrawingBuffer: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

renderer.setClearColor(0x000000, 0);

const light = new THREE.AmbientLight(0x404040);
scene.add(light);

document.getElementById('content').appendChild(renderer.domElement);

let materials = [];
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

		// const mapping = [];

		for (const hexagon of hexagons) {
			// const position = new THREE.Vector3();
			// position.setFromMatrixPosition(hexagon.matrixWorld);

			// mapping.push(
			// 	`{${Math.floor(position.x * 3)}, ${Math.floor(position.y * 3) + 3}}`
			// );

			const color = calc_color(0, 0, 0);

			const material = new THREE.MeshBasicMaterial({
				color: new THREE.Color(...color),
			});

			// const material = hexagon.material.clone();

			if (hexagon_caps[hexagon.id] !== undefined) {
				for (const cap of hexagon_caps[hexagon.id]) {
					cap.material = material;
				}
			}

			hexagon.material = material;
			materials.push(material);
		}

		// console.log(mapping.join(','));

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

const controls = new OrbitControls(camera, renderer.domElement);

function render() {
	requestAnimationFrame(render);

	controls.update();
	renderer.render(scene, camera);
}

render();

const color_blend = require('color-blend');

const calc_color = (r, g, b) => {
	const color = color_blend.overlay(window.default_color, {
		r,
		b,
		g,
		a: 0.9,
	});

	return [color.r / 255, color.g / 255, color.b / 255];
};

window.renderer = {
	setPixel: (i, r, g, b) => {
		if (materials[i]) {
			const color = calc_color(r, g, b);

			materials[i].color.setRGB(...color);
		}
	},

	reset: () => {
		for (const material of materials) {
			const material = window.default_material;

			if (hexagon_caps[hexagon.id] !== undefined) {
				for (const cap of hexagon_caps[hexagon.id]) {
					cap.material = material;
				}
			}

			hexagon.material = material;
		}
	},
};
