import * as THREE from "three";
import { create, all } from "mathjs";

import { MeshBVH, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh"; // BVH
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

const math = create(all, {});

var raycaster = new THREE.Raycaster();
raycaster.params.Line.threshold = 0.001;

var imageOffset = 0.2;
var imageSize = 1;

var images = [];

const pickableObjects = [];

function loadImage(scene, R, t, zoom, image_name, image_loader, totalNumberOfImages) {
    const pos = math.multiply(math.unaryMinus(math.transpose(R)), t);
    //View direction
    const view_direction = math.multiply(
        math.transpose(R),
        math.transpose(math.matrix([0, 0, -1]))
    );
    //View direction VECTOR
    const direction = new THREE.Vector3(
        view_direction.get([0]),
        -view_direction.get([1]),
        -view_direction.get([2])
    );

    // Afegir imatge
    const SCALE = 5 * imageSize;
    const image_path = "/images/low_res/" + image_name;
    const image_texture = image_loader.load(image_path, function () {
        image_texture.colorSpace = THREE.SRGBColorSpace;
        const isLandscape = image_texture.image.width > image_texture.image.height;
        const heightToWidthRelation = image_texture.image.height / image_texture.image.width;
        let width = 1;
        let height = 1;
        if (isLandscape) height = heightToWidthRelation;
        else width = 1 / heightToWidthRelation;

        const image_geometry = new THREE.PlaneGeometry(width / SCALE, height / SCALE)
            .rotateY(Math.PI)
            .translate(0, 0, 1);
        const image_material = new THREE.MeshBasicMaterial({
            map: image_texture,
        });
        const image_plane = new THREE.Mesh(image_geometry, image_material);
        image_plane.name = image_name;
        image_plane.lookAt(direction);
        image_plane.position.set(pos.get([0]), -pos.get([1]), -pos.get([2]));

        image_plane.scale.set(imageSize, imageSize, imageOffset);

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
                opacity: 0.5,
                linewidth: 0.2,
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
                opacity: 0.5,
                linewidth: 0.1,
            });
            const line = new THREE.Line(geometry, material);
            line.name = "wireframe-line";
            wireFrameObject.add(line);
        }
        image_plane.add(wireFrameObject);
        scene.add(image_plane);
        image_plane.userData = {
            zoom: zoom,
            direction: direction,
            intersection: null,
            isLandscape: isLandscape,
            heightToWidthRatio: heightToWidthRelation,
        };
        console.log(
            "Image: ",
            image_name,
            " Position: ",
            image_plane.position,
            " Direction: ",
            image_plane.userData.direction
        );

        images.push(image_plane);
        console.log("Images loaded: ", images.length, " out of ", totalNumberOfImages);
        if (images.length == totalNumberOfImages) {
            setIntersectionPosition(scene);
            console.timeEnd('threeJSLoading');
        }
    });
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

function setIntersectionPosition(scene) {
    console.log(scene);

    var gltf = scene.getObjectByName("model");
    gltf.updateMatrixWorld(true);
    gltf.traverse(function (child) {
        if (child.isMesh) {
            const m = child; // as THREE.Mesh
            m.geometry.computeBoundsTree(); // BVH
            pickableObjects.push(m);
        }
    });
    console.log("Pick:", pickableObjects);

    var model = scene.getObjectByName("model");
    //var model = scene;
    console.log(model);
    console.log("Setting intersection positions for ", images.length, " images...");
    let counter = 1;
    images.forEach((i) => {
        console.log("intersection: ", counter, " out of ", images.length);
        const intersectionPosition = getIntersectionPosition(
            scene,
            model,
            pickableObjects,
            i.position,
            i.userData.direction
        );
        i.userData.intersection = new THREE.Vector3().copy(intersectionPosition);
        i.userData.intersectionPointsMatrix = getIntersectionPointsMatrix(
            scene,
            model,
            pickableObjects,
            i
        );
        counter++;
    });
    console.log("Setting intersection positions: done!");
}

function getIntersectionPointsMatrix(scene, model, objs, object) {
    let M = [];
    for (let i = -0.3; i <= 0.3; i += 0.1) {
        let V = [];
        for (let j = -0.3; j <= 0.3; j += 0.1) {
            const objectPoint = new THREE.Vector3(i, j, 0);
            const worldPoint = objectPoint.clone().applyMatrix4(object.matrixWorld);
            const intersectionPoint = getIntersectionPosition(
                scene,
                model,
                objs,
                worldPoint,
                object.userData.direction
            );
            V.push(intersectionPoint);
        }
        M.push(V);
    }
    return M;
}

function getIntersectionPosition(scene, model, objs, position, direction) {
    raycaster.set(position, direction);
    //console.log("Position: ", position, " Direction: ", direction);
    raycaster.firstHitOnly = true; // BVH
    //var intersections = raycaster.intersectObjects(model, true); // BVH
    /*
    const invMat = new THREE.Matrix4();
    invMat.copy(model.matrixWorld).invert();
    raycaster.ray.applyMatrix4(invMat);
    */

    var intersections = raycaster.intersectObjects(objs, true); // BVH

    if (intersections.length == 0) {
        console.log("No intersection found");
        return position;
    }
    var i = 0;
    var j = -1;
    for (; i < intersections.length; i++) {
        //if (intersections[i].object.name != "wireframe" && intersections[i].object.name != "wireframe-line" && intersections[i].object.name != "" && intersections[i].object.name[0] != "S") break; // return intersections[i].point;
        //console.log("Intersected:", intersections[i].object);
        //if (intersections[i].object.name != "wireframe") j = i;
        if (intersections[i].object.name[0] == "P") {
            j = i;
            break; // return intersections[i].point;
        }
    }
    /*if (j != -1)
        console.log(
            "Position: ",
            position,
            " Intersection",
            intersections[j].point,
            intersections[j].object.name
        );*/
    return intersections[j].point;
}

function setImageVisibility(show) {
    images.forEach((i) => (i.visible = show));
}

export {
    loadImage,
    setSize,
    setOffset,
    getAllImages,
    setWireframe,
    setIntersectionPosition,
    setImageVisibility,
};
