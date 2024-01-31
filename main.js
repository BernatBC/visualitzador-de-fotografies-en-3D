import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
camera.position.z = 5;

//Add scene content here
addImage("images/non-square.jpeg");

animate();

function addImage(path) {
    var loader = new THREE.TextureLoader();
    var texture = loader.load(path, function () {
        const geometry = new THREE.PlaneGeometry( texture.image.width/200,texture.image.height/200);
        const material = new THREE.MeshBasicMaterial( { map: texture } );
        const plane = new THREE.Mesh( geometry, material );
        scene.add( plane );
    } );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
    renderer.render( scene, camera );
}