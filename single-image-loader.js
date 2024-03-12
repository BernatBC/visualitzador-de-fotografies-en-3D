import * as THREE from 'three'
import { create, all } from 'mathjs'

const math = create(all,  {})

function loadImage(scene, R, t, image_name, image_loader) {
    const pos = math.multiply(math.unaryMinus(math.transpose(R)),t)
    const camera_pos = [pos.get([0]), pos.get([1]), pos.get([2])]
    const sphere_geometry = new THREE.SphereGeometry( 0.01, 5, 5 ).translate(camera_pos[0], camera_pos[1], camera_pos[2]).rotateX(Math.PI);
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } ); 
    const sphere = new THREE.Mesh( sphere_geometry, material );
    scene.add( sphere );
    //Punta de la piràmide al centre mirant cap endavant
    const pyramid_geometry = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateZ(Math.PI/2)
    //Rotació
    //View direction
    const view_direction = math.multiply(math.transpose(R), math.transpose(math.matrix([0,0,-1])))
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
    pyramid_geometry.rotateY(-radZ);
    //Alçada
    const radY = math.asin(y/h)
    pyramid_geometry.rotateZ(-radY)
    //Portar-la a la posició de la càmera*
    pyramid_geometry.translate(camera_pos[0], camera_pos[1], camera_pos[2]).rotateX(Math.PI);
    const pyramid = new THREE.Mesh(pyramid_geometry, material);
    scene.add(pyramid);

    // Afegir imatge
    const SCALE = 1000;
    const offset = -1;
    const image_path = "/images/low_res/" + image_name
    const image_texture = image_loader.load(image_path, function () {
        image_texture.colorSpace = THREE.SRGBColorSpace;
        const image_geometry = new THREE.PlaneGeometry( image_texture.image.width/SCALE,image_texture.image.height/SCALE).rotateZ(Math.PI).rotateY(- radZ - Math.PI / 2).rotateZ(-radY).translate(camera_pos[0], camera_pos[1], camera_pos[2]).rotateX(Math.PI);
        const image_material = new THREE.MeshBasicMaterial( { map: image_texture } );
        const image_plane = new THREE.Mesh( image_geometry, image_material );
        image_plane.name = image_name;
        scene.add( image_plane );
    } );
}

export { loadImage }