const tauri = window.__TAURI__;

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const setup = async () => {
	const BLOOM_SCENE = 3;

	const bloomLayer = new THREE.Layers();
	bloomLayer.set(BLOOM_SCENE);

	let params = {
		threshold: 1,
		strength: 0.1,
		radius: 0,
		exposure: 1.5,
	};

	const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
	const materials = {};

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xffffff, 0);

	const scene = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		1,
		200
	);
	camera.position.set(0, 0, 20);
	camera.lookAt(0, 0, 0);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI * 0.5;
	controls.minDistance = 1;
	controls.maxDistance = 100;

	const loader = new GLTFLoader();

	const model_resource = await tauri.path.resolveResource(
		'static/panel.gltf'
	);
	const model = await tauri.fs.readTextFile(model_resource);

	let default_material;
	let set_default_material;
	let unset_default_material;;
	let hexagon_materials = [];

	const model_load = new Promise((resolve, reject) => {
		loader.parse(model, '', async (gltf) => {
			const model = gltf.scene;

			model.scale.set(
				25 * model.scale.x,
				25 * model.scale.y,
				25 * model.scale.z
			);

			model.traverse((object) => {
				if (object.material) object.material.metalness = 0;

				if (object.isMesh) {
					object.castShadow = true;
					object.receiveShadow = true;
				}
			});

			let hexagons = [];
			const caps = [];

			model.traverse((object) => {
				if (object.name) {
					if (object.name.includes('Hexagon_Cap') || object.name.includes('Hexagrid_Cap'))
						return object.children.length >= 2
							? caps.push(...object.children)
							: undefined;
					if (
						object.name.includes('Hexagon') &&
						object.parent.name.includes('Hexagrid')
					)
						return hexagons.push(object.children[0].children[0]);
				}
			});

			const hexagon_position = (hexagon) => {
				const vector = new THREE.Vector3();
				hexagon.getWorldPosition(vector);

				return vector;
			};

			const hexagon_rows = [];

			for await (const hexagon of hexagons) {
				const position = hexagon_position(hexagon);

				position.y = Math.floor(position.y * 4);

				if (!hexagon_rows[position.y]) hexagon_rows[position.y] = [];

				hexagon_rows[position.y].push(hexagon);
			}

			hexagon_rows.sort();
			hexagons = [];

			for await (let [row, hexagon_row] of Object.entries(hexagon_rows)) {
				const is_even =
					(parseInt(row) < 0
						? Math.floor(parseInt(row) / -3) + 1
						: parseInt(row)) % 2;

				hexagon_row = hexagon_row.sort((a, b) => {
					return hexagon_position(a).distanceTo(hexagon_position(b));
				});

				if (is_even != 0) hexagon_row.reverse();

				hexagons.push(...hexagon_row);
			}

			default_material = hexagons[0].material;

			for await (const [index, hexagon] of Object.entries(hexagons)) {
				hexagon.layers.enable(BLOOM_SCENE);

				const color = new THREE.Color();
				color.setRGB(hexagon.material.color.r, hexagon.material.color.g, hexagon.material.color.b);

				const material = new THREE.MeshBasicMaterial({ color: color });

				hexagon_materials[index] = material;
			}

			const hexagons_ = [...hexagons];
			const hexagon_caps = {};

			for await (const cap of caps) {
				cap.layers.enable(BLOOM_SCENE);

				const hexagon = hexagons_.sort((a, b) => {
					return hexagon_position(cap).distanceTo(hexagon_position(a)) - hexagon_position(cap).distanceTo(hexagon_position(b));
				})[0];

				if (!(hexagon.uuid in hexagon_caps)) hexagon_caps[hexagon.uuid] = [];

				hexagon_caps[hexagon.uuid].push(cap);

				// TODO: fix some caps being wrong color
			}


			unset_default_material = async () => {
				for await (const [index, hexagon] of Object.entries(hexagons)) {
					hexagon.material = hexagon_materials[index];

					if (hexagon.uuid in hexagon_caps) {
						for await (const cap of hexagon_caps[hexagon.uuid]) {
							cap.material = hexagon_materials[index];
						}
					}
				}
			};

			set_default_material = async () => {
				for await (const hexagon of hexagons) {
					hexagon.material = default_material;
				}

				for await (const uuid of caps) {
					for await (const cap of hexagon_caps[uuid]) {
						cap.material = default_material;
					}
				}
			};

			scene.add(model);

			resolve();
		});
	});

	await model_load;

	scene.add(new THREE.AmbientLight(0x898989));

	const renderScene = new RenderPass(scene, camera);

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		1.5,
		0.4,
		0.85
	);
	bloomPass.threshold = params.threshold;
	bloomPass.strength = params.strength;
	bloomPass.radius = params.radius;

	const bloomComposer = new EffectComposer(renderer);
	bloomComposer.renderToScreen = false;
	bloomComposer.addPass(renderScene);
	bloomComposer.addPass(bloomPass);

	const mixPass = new ShaderPass(
		new THREE.ShaderMaterial({
			uniforms: {
				baseTexture: { value: null },
				bloomTexture: { value: bloomComposer.renderTarget2.texture },
			},
			vertexShader: document.getElementById('vertexshader').textContent,
			fragmentShader:
				document.getElementById('fragmentshader').textContent,
			defines: {},
		}),
		'baseTexture'
	);
	mixPass.needsSwap = true;

	const outputPass = new OutputPass(THREE.ReinhardToneMapping);
	outputPass.toneMappingExposure = params.exposure;

	const finalComposer = new EffectComposer(renderer);
	finalComposer.addPass(renderScene);
	finalComposer.addPass(mixPass);
	finalComposer.addPass(outputPass);

	const darkenNonBloomed = (obj) => {
		if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
			materials[obj.uuid] = obj.material;
			obj.material = darkMaterial;
		}
	};

	const restoreMaterial = (obj) => {
		if (materials[obj.uuid]) {
			obj.material = materials[obj.uuid];
			delete materials[obj.uuid];
		}
	};

	const set_pixel = (i, r, g, b) => {
		if (hexagon_materials[i]) hexagon_materials[i].color.setRGB(r / 255, g / 255, b / 255);
	};

	const render = () => {
		scene.traverse(darkenNonBloomed);
		bloomComposer.render();
		scene.traverse(restoreMaterial);

		finalComposer.render();
	};

	const turn_on = async () => {
		bloomPass.threshold = 0;
		await unset_default_material();
		render();
	};
	const turn_off = async () => {
		bloomPass.threshold = 1;
		await set_default_material();
		render();
	};

	controls.addEventListener('change', render);

	window.onresize = function () {
		const width = window.innerWidth;
		const height = window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

		bloomComposer.setSize(width, height);
		finalComposer.setSize(width, height);

		render();
	};

	document.getElementById('panel').appendChild(renderer.domElement);

	render();

	return { render, is_on: params.threshold, turn_on, turn_off, set_pixel };
};
