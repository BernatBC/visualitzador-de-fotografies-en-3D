import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { create, all } from 'mathjs'

//SETUP
const math = create(all,  {})

THREE.Cache.enabled = true;

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xdadada );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0,0,0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0, -15)

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

//MODEL LOADER
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

//Read Images file
function read_image_list(filePath) {
    return new Promise((resolve) => {
        const loader = new THREE.FileLoader();
        loader.load(filePath, (data) => {
            resolve(data.split('\n'));
        });
    });
}

const image_list = await read_image_list('out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-llistaImatges_converted-converted.lst')

//CAMERAS LOADER
const image_loader = new THREE.TextureLoader();
const out_file_loader = new THREE.FileLoader();
out_file_loader.load( 'out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-registre.out',
	function ( data ) {
        const lines = data.split('\n');
        const num_cameras = lines[1].split(' ')[0]
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
            //const x = view_direction.get([0]) - camera_pos[0];
            //const y = view_direction.get([1]) - camera_pos[1];
            //const z = view_direction.get([2]) - camera_pos[2];
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

            // Afegir imatge
            const SCALE = 200;
            const offset = -0.2;
            const image_path = "/images/low_res/" + image_list[i];
            const image_texture = image_loader.load(image_path, function () {
                image_texture.colorSpace = THREE.SRGBColorSpace;
                const image_geometry = new THREE.PlaneGeometry( image_texture.image.width/SCALE,image_texture.image.height/SCALE).translate(offset, 0, 0).rotateY(radZ - Math.PI / 2).rotateZ(radY).translate(camera_pos[0], camera_pos[1], camera_pos[2]);
                const image_material = new THREE.MeshBasicMaterial( { map: image_texture } );
                const image_plane = new THREE.Mesh( image_geometry, image_material );
                image_plane.name = image_list[i];
                scene.add( image_plane );
            } );
        } 
	}
);

// OBRIR IMATGES EN OPENSEADRAGON
var mDragging = false;
var mDown = false;

window.addEventListener('mousedown', function () {
    mDown = true;
});
window.addEventListener('mousemove', function () {
    if(mDown) {
        mDragging = true;
    }
});
window.addEventListener('mouseup', function() {
    if(mDragging === false) {
        onClick()
    }
    mDown = false;
    mDragging = false;
});

var mouse = new THREE.Vector2()
var raycaster = new THREE.Raycaster();

function onClick() {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
        var object = intersects[0].object;
        if (object.name.startsWith('Sant Quirze de Pedret by Zones')) {
            const url = 'openseadragon.html?image=' + encodeURIComponent(object.name);
            window.open(url, '_blank')
        }
    }
      render();
}

// HOVERING IMATGES
var hover = undefined

function hoverIn(image_object) {
    image_object.material.color.setHex( 0xccffff )
    hover = image_object
}

function hoverOut() {
    hover.material.color.setHex( 0xffffff )
    hover = undefined
}

function onHover() {
    if (mDragging) return
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
        var object = intersects[0].object;
        if (object.name.startsWith('Sant Quirze de Pedret by Zones')) {
            // New Hover
            if (hover === undefined) hoverIn(object)
            // Replace hover
            else if (hover.name !== object.name) {
                hoverOut()
                hoverIn(object)
            }
        }
        // Hovering a non-image object
        else if (hover !== undefined) hoverOut();
    }
    //No hovering any image
    else if (hover !== undefined) hoverOut();

    render();
}

window.addEventListener('resize', onWindowResize, false)
window.addEventListener('pointermove', onHover);

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