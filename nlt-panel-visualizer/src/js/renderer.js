import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
const loader = new GLTFLoader();

loader.load(
	'/assets/panel.gltf',
	function (gltf) {
        console.log(gltf)
		scene.add(gltf.scene);
	},
	// called while loading is progressing
	function (xhr) {
		console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
	},
	// called when loading has errors
	function (error) {
		console.error(error);
	}
);
