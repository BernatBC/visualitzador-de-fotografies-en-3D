import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {loadImages} from './multiple-image-loader.js'
import { addInteraction } from './interaction.js';

//INIT
THREE.Cache.enabled = true;

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xdadada );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(5,5,5)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0, 0)

//LIGHTING
const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)

const light = new THREE.PointLight(0xffffff, 50)
light.position.set(0,5,-10)
scene.add(light)
const light2 = new THREE.PointLight(0xffffff, 50)
light2.position.set(0,10,-20)
scene.add(light2)
const light3 = new THREE.PointLight(0xffffff, 50)
light3.position.set(10,10,-15)
scene.add(light3)
const light4 = new THREE.PointLight(0xffffff, 50)
light4.position.set(-10,10,-25)
scene.add(light4)

//AXIS
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );


//MODEL LOADER
const gltfLoader = new GLTFLoader()
gltfLoader.load('models/pedret10/MNAC-AbsSud-LowPoly.glb',(object) => {
//gltfLoader.load('models/pedret/pedret_XIII_text4K.glb',(object) => {
    scene.add(object.scene.rotateX(-Math.PI/2))
})

await loadImages(scene, 'out-files/MNAC-AbsidiolaSud/MNAC-AbsSud-CamerasList-converted.lst', 'out-files/MNAC-AbsidiolaSud/MNAC-AbsSud-CamerasRegistration.out')

addInteraction(camera, scene)

window.addEventListener('resize', onWindowResize, false)


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()

export { render }