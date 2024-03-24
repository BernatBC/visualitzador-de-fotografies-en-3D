import * as THREE from 'three'
import { create, all } from 'mathjs'

const math = create(all,  {})

var imageOffset = 0
var imageSize = 1

var images = []
var image_names = []
var camera_positions = []
var Rs = []

function loadImage(scene, R, t, image_name, image_loader) {
    const pos = math.multiply(math.unaryMinus(math.transpose(R)),t)
    const camera_pos = [pos.get([0]), pos.get([1]), pos.get([2])]
    const sphere_geometry = new THREE.SphereGeometry( 0.01, 5, 5 ).translate(camera_pos[0], camera_pos[1], camera_pos[2]).rotateX(Math.PI);
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } ); 
    const sphere = new THREE.Mesh( sphere_geometry, material );
    scene.add( sphere );
    //Rotació
    //View direction
    const view_direction = math.multiply(math.transpose(R), math.transpose(math.matrix([0,0,-1])))
    //View direction VECTOR
    const x = view_direction.get([0])
    const y = view_direction.get([1])
    const z = view_direction.get([2])

    const pyramid_geometry = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(-Math.PI/2)
    const pyramid = new THREE.Mesh(pyramid_geometry, material);
    pyramid.lookAt(x,-y,-z)
    pyramid.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid);

    // Afegir imatge
    const SCALE = 1000*imageSize;
    const offset = imageOffset;
    const image_path = "/images/low_res/" + image_name
    const image_texture = image_loader.load(image_path, function () {
        image_texture.colorSpace = THREE.SRGBColorSpace;
        const image_geometry = new THREE.PlaneGeometry( image_texture.image.width/SCALE,image_texture.image.height/SCALE).rotateY(Math.PI)
        const image_material = new THREE.MeshBasicMaterial( { map: image_texture } );
        const image_plane = new THREE.Mesh( image_geometry, image_material );
        image_plane.name = image_name;
        image_plane.lookAt(x,-y,-z)
        image_plane.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
        scene.add(image_plane);
        images.push(image_plane)
    } );

    image_names.push(image_name)
    camera_positions.push(camera_pos)
    Rs.push(R)
}

function setSize(value) {
    console.log("New image size: " + String(value))
    for (let i = 0; i < images.length; i++) {
        let camera_pos = camera_positions[i]
        let image = images[i]
        //Bring to 0,0,0 // S'HA DE TENIR EN COMPTE L'OFFSET
        image.position.set(-camera_pos[0], camera_pos[1], camera_pos[2])
        // Resize
        image.scale.set(1/imageSize, 1/imageSize, 1/imageSize)
        image.scale.set(value, value, value)
        //Bring back to its place
        image.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    }
    imageSize = value
}

function setOffset(value) {
    console.log("New image offset: " + String(value))
    for (let i = 0; i < images.length; i++) {
        let camera_pos = camera_positions[i]
        let R = Rs[i]
        let image = images[i]
        let direction = math.multiply(math.transpose(R), math.transpose(math.matrix([0,0,-1])))
        let new_pos = math.add(math.matrix(camera_pos), math.multiply(math.number(value), direction))
        image.position.set(new_pos.get([0]), -new_pos.get([1]), -new_pos.get([2]))
    }
    imageOffset = value
}

export { loadImage, setSize, setOffset }