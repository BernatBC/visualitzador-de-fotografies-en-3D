import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { loadImages } from "./multiple-image-loader.js";
import { addInteraction } from "./interaction.js";
import { createPanel } from "./panel.js";
import { setIntersectionPosition } from "./single-image-loader.js";

//INIT
THREE.Cache.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdadada);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / (window.innerHeight - 25),
    0.1,
    1000
);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight - 25);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

//LIGHTING
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 50);
light.position.set(0, 5, -10);
scene.add(light);
const light2 = new THREE.PointLight(0xffffff, 50);
light2.position.set(0, 10, -20);
scene.add(light2);
const light3 = new THREE.PointLight(0xffffff, 50);
light3.position.set(10, 10, -15);
scene.add(light3);
const light4 = new THREE.PointLight(0xffffff, 50);
light4.position.set(-10, 10, -25);
scene.add(light4);

//AXIS
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

createPanel();

//MODEL LOADER
const gltfLoader = new GLTFLoader();
//gltfLoader.load("models/pedret10/MNAC-AbsSud-LowPoly.glb", (object) => {
gltfLoader.load("models/pedret/pedret_XII_text4K.glb", (object) => {
    const matrix = new THREE.Matrix4().set(
        -0.996301,
        0.069092,
        -0.051103,
        6.341516,
        -0.052068,
        -0.01224,
        0.998569,
        13.402682,
        0.068368,
        0.997535,
        0.015792,
        1.105989,
        0.0,
        0.0,
        0.0,
        1.0
    );
    const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
    const scale = new THREE.Vector3().setFromMatrixScale(matrix);
    const rotation = new THREE.Quaternion().setFromRotationMatrix(matrix);

    console.log(object.scene);

    object.scene.position.copy(pos);
    object.scene.scale.copy(scale);
    object.scene.quaternion.copy(rotation);

    object.scene.name = "model";

    const wrapper = new THREE.Object3D();
    wrapper.name = "model";
    wrapper.add(object.scene);
    wrapper.rotateX(-Math.PI / 2);

    scene.add(wrapper);
    setIntersectionPosition(scene);
});

await loadImages(
    scene,
    "out-files/MNAC-AbsidiolaSud/MNAC-AbsSud-CamerasList-converted.lst",
    "out-files/MNAC-AbsidiolaSud/MNAC-AbsSud-CamerasRegistration.out"
);

addInteraction(camera, scene, controls);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - 25);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 25);
    render();
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    render();
}

function render() {
    renderer.render(scene, camera);
}

animate();

export { render };
