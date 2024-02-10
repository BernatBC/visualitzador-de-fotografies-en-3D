import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { create, all } from 'mathjs'

const math = create(all,  {})

THREE.Cache.enabled = true;
const scene = new THREE.Scene()

scene.background = new THREE.Color( 0xdadada );

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

/*
const fbxLoader = new FBXLoader()
fbxLoader.load('models/pedret/pedret_XIII.fbx',(object) => {
    object.scale.set(.01, .01, .01)
    scene.add(object)
})*/

/*
const gltfLoader = new GLTFLoader()
gltfLoader.load('models/pedret/pedret_XIII.glb',(object) => {
    object.scale.set(.01, .01, .01)
    scene.add(object)
})*/

const mtlLoader = new MTLLoader()
mtlLoader.load("models/pedret/pedret_XII.mtl", function(materials)
{
    materials.preload();
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("models/pedret/pedret_XII.obj", function(object)
    {    
        scene.add( object );
    });
});

const out_file_loader = new THREE.FileLoader();
out_file_loader.load( 'out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-registre.out',
	function ( data ) {
        const lines = data.split('\n');
        const num_cameras = lines[1].split(' ')[0]
        console.log(num_cameras)
        for (let i = 0; i < num_cameras; i++) {
            const line_number = 2 + 5*i;
            const R = math.matrix([lines[line_number + 1].split(' ').map(parseFloat), lines[line_number + 2].split(' ').map(parseFloat), lines[line_number + 3].split(' ').map(parseFloat)]);
            const t = math.matrix(lines[line_number + 4].split(' ').map(parseFloat));

            const pos = math.multiply(math.transpose(math.unaryMinus(R)),t)
            const camera_pos = [pos.get([0]), pos.get([1]), pos.get([2])]
            //console.log(camera_pos)

            const sphere_geometry = new THREE.SphereGeometry( 0.03, 5, 5 ).translate(camera_pos[0], camera_pos[1], camera_pos[2]);
            const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } ); 
            const sphere = new THREE.Mesh( sphere_geometry, material );
            scene.add( sphere );
            //Punta de la piràmide al centre mirant cap endavant
            const pyramid_geometry = new THREE.ConeGeometry(0.2,0.2,4).rotateY(Math.PI / 4).translate(0,-0.1,0).rotateZ(Math.PI/2)
            //Rotació
            //View direction
            const view_direction = math.multiply(math.transpose(R), math.transpose(math.matrix([0,0,-1])))
            //const view_direction = math.matrix([1,0,0]);
            // View direction PUNT
            /*const x = view_direction.get([0]) - camera_pos[0];
            const y = view_direction.get([1]) - camera_pos[1];
            const z = view_direction.get([2]) - camera_pos[2];*/
            //View direction VECTOR
            const x = view_direction.get([0])
            const y = view_direction.get([1])
            const z = view_direction.get([2])
            const h = math.sqrt(x*x + y*y + z*z)
            //EIX X-Z
            let radZ = 0
            if (x < 0) {
                radZ = Math.PI - math.asin(z/h)
            }
            else {
                radZ = math.asin(z/h)
            }
            pyramid_geometry.rotateY(radZ);
            //Alçada
            const radY = math.asin(y/h)
            pyramid_geometry.rotateZ(radY)
            //Portar-la a la posició de la càmera*
            pyramid_geometry.translate(camera_pos[0], camera_pos[1], camera_pos[2]);
            const pyramid = new THREE.Mesh(pyramid_geometry, material);
            scene.add(pyramid);
          } 
	}
);
/*
const sphere_geometry2 = new THREE.SphereGeometry( 0.03, 5, 5 ).translate(0,0,0);
const material2 = new THREE.MeshBasicMaterial( { color: 0x0000ff } ); 
const sphere2 = new THREE.Mesh( sphere_geometry2, material2 );
scene.add( sphere2 );*/

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