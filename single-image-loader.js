import * as THREE from "three";
import { create, all } from "mathjs";

const math = create(all, {});

var imageOffset = 0.2;
var imageSize = 1;

var images = [];
var image_names = [];
var camera_positions = [];
var Rs = [];
var real_positions = [];
var indices = {};

function loadImage(i, scene, R, t, image_name, image_loader) {
    const pos = math.multiply(math.unaryMinus(math.transpose(R)), t);
    const camera_pos = [pos.get([0]), pos.get([1]), pos.get([2])];
    //View direction
    const view_direction = math.multiply(
        math.transpose(R),
        math.transpose(math.matrix([0, 0, -1]))
    );
    //View direction VECTOR
    const x = view_direction.get([0]);
    const y = view_direction.get([1]);
    const z = view_direction.get([2]);

    // Afegir imatge
    const SCALE = 2000 * imageSize;
    const image_path = "/images/low_res/" + image_name;
    const image_texture = image_loader.load(image_path, function () {
        image_texture.colorSpace = THREE.SRGBColorSpace;
        const image_geometry = new THREE.PlaneGeometry(
            image_texture.image.width / SCALE,
            image_texture.image.height / SCALE
        )
            .rotateY(Math.PI)
            .translate(0, 0, 1);
        const image_material = new THREE.MeshBasicMaterial({
            map: image_texture,
        });
        const image_plane = new THREE.Mesh(image_geometry, image_material);
        image_plane.name = image_name;
        image_plane.lookAt(x, -y, -z);
        image_plane.position.set(pos.get([0]), -pos.get([1]), -pos.get([2]));

        image_plane.scale.set(imageSize, imageSize, imageOffset);

        images.push(image_plane);

        const verticePositions = image_geometry.getAttribute("position");
        var wireFrameObject = new THREE.Object3D();
        wireFrameObject.name = "wireframe";
        // Center to vertice
        for (let k = 0; k < 4; k++) {
            const vertice = new THREE.Vector3().fromBufferAttribute(verticePositions, k);
            const points = [vertice, new THREE.Vector3(0, 0, 0)];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff,
                transparent: true,
                opacity: 0.25,
                linewidth: 0.1,
            });
            const line = new THREE.Line(geometry, material);
            line.name = "wireframe-line";
            wireFrameObject.add(line);
        }
        //Image countorn
        for (let k = 0; k < 4; k++) {
            const vertice1 = new THREE.Vector3().fromBufferAttribute(verticePositions, k);
            let a = 1;
            if (k == 1) a = 3;
            else if (k == 2) a = 0;
            else if (k == 3) a = 2;
            const vertice2 = new THREE.Vector3().fromBufferAttribute(verticePositions, a);
            const points = [vertice1, vertice2];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff,
                transparent: true,
                opacity: 0.25,
                linewidth: 0.1,
            });
            const line = new THREE.Line(geometry, material);
            line.name = "wireframe-line";
            wireFrameObject.add(line);
        }
        image_plane.add(wireFrameObject);
        scene.add(image_plane);
    });

    image_names.push(image_name);
    camera_positions.push(camera_pos);
    Rs.push(R);
    indices[image_name] = i;
}

function setSize(value) {
    console.log("New image size: " + String(value));
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        image.scale.set(1 / imageSize, 1 / imageSize, 1 / imageOffset);
        image.scale.set(value, value, imageOffset);
    }
    imageSize = value;
}

function setOffset(value) {
    console.log("New image offset: " + String(value));
    for (let i = 0; i < images.length; i++) {
        let image = images[i];
        image.scale.set(1 / imageSize, 1 / imageSize, 1 / imageOffset);
        image.scale.set(imageSize, imageSize, value);
    }
    imageOffset = value;
}

function getAllImages() {
    return images;
}

function setWireframe(enable) {
    console.log("Setting wireframe: " + enable);
    for (let i = 0; i < images.length; i++) {
        let image = images[i];
        image.children[0].visible = enable;
    }
}

export { loadImage, setSize, setOffset, getAllImages, setWireframe };
