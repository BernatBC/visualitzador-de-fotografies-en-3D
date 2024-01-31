import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.PlaneGeometry( 4, 4 );

//Textures
const texture = new THREE.TextureLoader().load( "public/images/default.png" );

const material = new THREE.MeshBasicMaterial( { map: texture } );
const plane = new THREE.Mesh( geometry, material );

scene.add( plane );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
    renderer.render( scene, camera );
}
animate();