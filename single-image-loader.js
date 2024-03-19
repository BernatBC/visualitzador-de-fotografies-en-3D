import * as THREE from 'three'
import { create, all } from 'mathjs'

const math = create(all,  {})

var imageOffset = 0
var imageSize = 1

var images = []
var image_names = []
var camera_positions = []
var rotationY = []
var rotationZ = []

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

    const roll = -math.atan2(R.get([2,1]), R.get([2,2]))
    console.log(roll)

    pyramid_geometry.rotateY(-radZ);
    //Alçada
    const radY = math.asin(y/h)
    pyramid_geometry.rotateZ(-radY)
    //Portar-la a la posició de la càmera*
    pyramid_geometry.translate(camera_pos[0], camera_pos[1], camera_pos[2]).rotateX(Math.PI);
    const pyramid = new THREE.Mesh(pyramid_geometry, material);
    scene.add(pyramid);


    // PYRAMID 2
    const M2 = new THREE.Matrix4(
        R.get([0,0]),R.get([0,1]),R.get([0,2]),0,
        R.get([1,0]),R.get([1,1]),R.get([1,2]),0,
        R.get([2,0]),R.get([2,1]),R.get([2,2]),0,
        0,0,0,1);
        console.log(M2)
        const euler = new THREE.Euler().setFromRotationMatrix(M2)
        //euler.x = -euler.x;
        //euler.y = -euler.y;
        //euler.z = -euler.z;
        const M = new THREE.Matrix4().makeRotationFromEuler(euler)
        console.log(M)

        /*const pyramid_geometry2 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0)
        const material2 = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        const pyramid2 = new THREE.Mesh(pyramid_geometry2, material2);
        pyramid2.rotation.setFromRotationMatrix(M)
        pyramid2.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
        scene.add(pyramid2);*/
    
    const pyramid_geometry2 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI/2).rotateZ(Math.PI/2)
    const material2 = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    const pyramid2 = new THREE.Mesh(pyramid_geometry2, material2);
    pyramid2.rotation.setFromRotationMatrix(M)
    pyramid2.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid2);

    const pyramid_geometry3 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI).rotateZ(Math.PI/2)
    const material3 = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
    const pyramid3 = new THREE.Mesh(pyramid_geometry3, material3);
    pyramid3.rotation.setFromRotationMatrix(M)
    pyramid3.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid3);

    const pyramid_geometry4 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(-Math.PI/2).rotateZ(Math.PI/2)
    const material4 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const pyramid4 = new THREE.Mesh(pyramid_geometry4, material4);
    pyramid4.rotation.setFromRotationMatrix(M)
    pyramid4.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid4);

    const pyramid_geometry5 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI/2).rotateZ(-Math.PI/2)
    const material5 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    const pyramid5 = new THREE.Mesh(pyramid_geometry5, material5);
    pyramid5.rotation.setFromRotationMatrix(M)
    pyramid5.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid5);

    const pyramid_geometry6 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI).rotateZ(-Math.PI/2)
    const material6 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const pyramid6 = new THREE.Mesh(pyramid_geometry6, material6);
    pyramid6.rotation.setFromRotationMatrix(M)
    pyramid6.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid6);

    const pyramid_geometry7 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(-Math.PI/2).rotateZ(-Math.PI/2)
    const material7 = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
    const pyramid7 = new THREE.Mesh(pyramid_geometry7, material7);
    pyramid7.rotation.setFromRotationMatrix(M)
    pyramid7.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid7);

    const pyramid_geometry8 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI/2).rotateZ(Math.PI)
    const material8 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    const pyramid8 = new THREE.Mesh(pyramid_geometry8, material8);
    pyramid8.rotation.setFromRotationMatrix(M)
    pyramid8.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid8);

    const pyramid_geometry9 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI).rotateZ(Math.PI)
    const material9 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const pyramid9 = new THREE.Mesh(pyramid_geometry9, material9);
    pyramid9.rotation.setFromRotationMatrix(M)
    pyramid9.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid9);

    const pyramid_geometry10 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(-Math.PI/2).rotateZ(Math.PI)
    const material10 = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
    const pyramid10 = new THREE.Mesh(pyramid_geometry10, material10);
    pyramid10.rotation.setFromRotationMatrix(M)
    pyramid10.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid10);

    const pyramid_geometry11 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0)
    const material11 = new THREE.MeshBasicMaterial( { color: 0x777777 } );
    const pyramid11 = new THREE.Mesh(pyramid_geometry11, material11);
    pyramid11.rotation.setFromRotationMatrix(M)
    pyramid11.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid11);

    const pyramid_geometry12 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI/2)
    const material12 = new THREE.MeshBasicMaterial( { color: 0x770000 } );
    const pyramid12 = new THREE.Mesh(pyramid_geometry12, material12);
    pyramid12.rotation.setFromRotationMatrix(M)
    pyramid12.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid12);

    const pyramid_geometry13 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(-Math.PI/2)
    const material13 = new THREE.MeshBasicMaterial( { color: 0x007700 } );
    const pyramid13 = new THREE.Mesh(pyramid_geometry13, material13);
    pyramid13.rotation.setFromRotationMatrix(M)
    pyramid13.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid13);

    const pyramid_geometry14 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateX(Math.PI)
    const material14 = new THREE.MeshBasicMaterial( { color: 0x000077 } );
    const pyramid14 = new THREE.Mesh(pyramid_geometry14, material14);
    pyramid14.rotation.setFromRotationMatrix(M)
    pyramid14.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid14);

    const pyramid_geometry15 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateZ(Math.PI/2)
    const material15 = new THREE.MeshBasicMaterial( { color: 0x007777 } );
    const pyramid15 = new THREE.Mesh(pyramid_geometry15, material15);
    pyramid15.rotation.setFromRotationMatrix(M)
    pyramid15.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid15);

    const pyramid_geometry16 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateZ(Math.PI)
    const material16 = new THREE.MeshBasicMaterial( { color: 0x770077 } );
    const pyramid16 = new THREE.Mesh(pyramid_geometry16, material16);
    pyramid16.rotation.setFromRotationMatrix(M)
    pyramid16.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid16);

    const pyramid_geometry17 = new THREE.ConeGeometry(0.05,0.05,4).rotateY(Math.PI / 4).translate(0,-0.025,0).rotateZ(-Math.PI/2)
    const material17 = new THREE.MeshBasicMaterial( { color: 0x777700 } );
    const pyramid17 = new THREE.Mesh(pyramid_geometry17, material17);
    pyramid17.rotation.setFromRotationMatrix(M)
    pyramid17.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
    scene.add(pyramid17);
    // Afegir imatge
    const SCALE = 1000*imageSize;
    const offset = imageOffset;
    const image_path = "/images/low_res/" + image_name
    const image_texture = image_loader.load(image_path, function () {
        image_texture.colorSpace = THREE.SRGBColorSpace;
        const image_geometry = new THREE.PlaneGeometry( image_texture.image.width/SCALE,image_texture.image.height/SCALE).rotateZ(Math.PI).rotateY(-Math.PI/2).translate(offset,0,0).rotateY(-radZ)//.rotateZ(-radY)//.translate(camera_pos[0], camera_pos[1], camera_pos[2])//.rotateX(Math.PI);
        const image_material = new THREE.MeshBasicMaterial( { map: image_texture } );
        const image_plane = new THREE.Mesh( image_geometry, image_material );
        image_plane.name = image_name;
        //image_plane.rotation.set(0, -radZ, 0)
        image_plane.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
        image_plane.rotation.set(Math.PI, 0, -radY)
        scene.add(image_plane);
        images.push(image_plane)
    } );
    image_names.push(image_name)
    camera_positions.push(camera_pos)
    rotationY.push(radY)
    rotationY.push(radZ)
}

function setSize(value) {
    console.log("New image size: " + String(value))
    for (let i = 0; i < images.length; i++) {
        let camera_pos = camera_positions[i]
        let image = images[i]
        //Bring to 0,0,0 // S'HA DE TENIR EN COMPTE L'OFFSET
        //image.rotation.set(-Math.PI, 0, radY)
        image.position.set(-camera_pos[0], camera_pos[1], camera_pos[2])
        // Resize
        image.scale.set(1/imageSize, 1/imageSize, 1/imageSize)
        image.scale.set(value, value, value)
        //Bring back to its place
        image.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
        //image.rotation.set(Math.PI, 0, -radY)
    }
    imageSize = value
}

function setOffset(value) {
    console.log("New image offset: " + String(value))
    for (let i = 0; i < images.length; i++) {
        let camera_pos = camera_positions[i]
        let image = images[i]
        let radY = rotationY[i]
        let radZ = rotationY[i]
        //Bring to 0,0,0
        image.rotation.set(-Math.PI, 0, 0)
        image.position.set(-camera_pos[0], camera_pos[1], camera_pos[2])
        // Remake offset
        image.scale.set(1/imageSize, 1/imageSize, 1/imageSize)
        image.scale.set(value, value, value)
        //Bring back to its place
        image.position.set(camera_pos[0], -camera_pos[1], -camera_pos[2])
        image.rotation.set(Math.PI, 0, 0)
    }
    imageOffset = value
}

export { loadImage, setSize, setOffset }