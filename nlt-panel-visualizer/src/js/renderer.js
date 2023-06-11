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

	const params = {
		threshold: 0,
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

	const hexagons = [];
	const hexagon_caps = [];

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

			model.traverse((object) => {
				if (object.name) {
					if (object.name.includes('Hexagon_Cap'))
						return object.children.length >= 2
							? hexagon_caps.push(...object.children)
							: undefined;
					if (
						object.name.includes('Hexagon') &&
						object.parent.name.includes('Hexagrid')
					)
						return hexagons.push(object.children[0].children[0]);
				}
			});

			for await (const hexagon of hexagons) {
				hexagon.layers.enable(BLOOM_SCENE);
			}

			for await (const hexagon of hexagon_caps) {
				hexagon.layers.enable(BLOOM_SCENE);
			}

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

	let is_on = false

	const render = () => {
		scene.traverse(darkenNonBloomed);
		if (is_on) bloomComposer.render();
		scene.traverse(restoreMaterial);

		finalComposer.render();
	};

	const turn_on = () => is_on = true
	const turn_off = () => is_on = false

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

	return { render, turn_on, turn_off };
};
