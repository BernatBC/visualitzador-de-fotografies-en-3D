import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { create, all } from 'mathjs'

const math = create(all,  {})

THREE.Cache.enabled = true;
const scene = new THREE.Scene()

scene.background = new THREE.Color( 0xADD8E6 );

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)

const light = new THREE.PointLight(0xffffff, 50)
light.position.set(2,2,8)
scene.add(light)
const light2 = new THREE.PointLight(0xffffff, 50)
light2.position.set(-2,2,-8)
scene.add(light2)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(2,2,8)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0, 0)

//const material = new THREE.MeshNormalMaterial()

const fbxLoader = new FBXLoader()
fbxLoader.load('models/cottage.fbx',(object) => {
    object.scale.set(.0002, .0002, .0002)
    scene.add(object)
})

const out_file_loader = new THREE.FileLoader();
out_file_loader.load( 'out-files/model.out',
	function ( data ) {
        const lines = data.split('\n');
        const num_cameras = lines[1].split(' ')[0]
        for (let i = 0; i < num_cameras; i++) {
            const line_number = 2 + 5*i;
            const R = math.matrix([lines[line_number + 1].split(' ').map(parseFloat), lines[line_number + 2].split(' ').map(parseFloat), lines[line_number + 3].split(' ').map(parseFloat)]);
            const t = math.matrix(lines[line_number + 4].split(' ').map(parseFloat));
            
            console.log(t)
            console.log(R)
            console.log(math.unaryMinus(R))

            const pos = math.multiply(math.transpose(math.unaryMinus(R)),t)
            const camera_pos = [pos.get([0]), pos.get([1]), pos.get([2])]
            console.log(camera_pos)

            const sphere_geometry = new THREE.SphereGeometry( 0.03, 5, 5 ).translate(camera_pos[0], camera_pos[1], camera_pos[2]);; 
            const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } ); 
            const sphere = new THREE.Mesh( sphere_geometry, material );
            scene.add( sphere );
            /*const pyramid_geometry = new THREE.ConeGeometry(0.2,0.2,4).rotateY(Math.PI / 4).translate(camera_pos[0], camera_pos[1]-0.1, camera_pos[2]);
            const pyramid = new THREE.Mesh(pyramid_geometry, material);
            scene.add(pyramid);*/
          } 
	}
);

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