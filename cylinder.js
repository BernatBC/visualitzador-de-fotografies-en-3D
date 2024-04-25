import * as THREE from "three";
import {
    getAllImages,
    clearSelection,
    getSelectedImages,
    paintRangeImages,
    clearRangeImages,
} from "./interaction";
import { create, all } from "mathjs";

const math = create(all, {});

var radius = 0.5;

var scene;
var cylinderObject;
var height = 1;

var centerPoint;
var vector;

function setScene(sce) {
    scene = sce;
}

function openCylindricalImages() {
    console.log("opening");
    let images = getAllImages();
    let json = [];

    const endPoint1 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).add(vector);
    const endPoint2 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).sub(vector);
    const infiniteVector = new THREE.Vector3(
        vector.x,
        vector.y,
        vector.z
    ).multiplyScalar(1000);
    const point1 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).add(infiniteVector);
    const point2 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).sub(infiniteVector);

    const segment = new THREE.Line3(endPoint1, endPoint2);
    const infiniteLine = new THREE.Line3(point1, point2);

    images.forEach((object) => {
        const P = object.position;
        var lDistance = new THREE.Vector3();
        var sDistance = new THREE.Vector3();
        infiniteLine.closestPointToPoint(P, false, lDistance);
        segment.closestPointToPoint(P, false, sDistance);
        const lineDistance = lDistance.distanceTo(P).toFixed(5);
        const segmentDistance = sDistance.distanceTo(P).toFixed(5);
        if (lineDistance < radius && lineDistance == segmentDistance) {
            json.push({
                name: object.name,
                x: 0,
                y: 0,
                height: object.geometry.parameters.height,
            });
        }
    });

    let jsonContent = JSON.stringify(json);
    localStorage.setItem("images", jsonContent);
    const url = "openseadragon.html?mode=spherical";

    window.open(url, "_blank");
    clearSelection();
}

function applyCylindricalRadius(r) {
    clearRangeImages();
    cylinderObject.scale.set(1 / radius, 1 / radius, 1 / height);
    cylinderObject.scale.set(r, r, height);
    radius = r;
    paintRange();
}

function createCylinder() {
    var imagesSelected = getSelectedImages();
    if (imagesSelected.size != 2) {
        console.log("You need to select exactly 2 images");
        return;
    }
    const images = Array.from(imagesSelected);
    const P1 = images[0].position;
    const P2 = images[1].position;

    const V = new THREE.Vector3().subVectors(P2, P1).normalize();

    centerPoint = new THREE.Vector3(
        (P1.x + P2.x) / 2,
        (P1.y + P2.y) / 2,
        (P1.z + P2.z) / 2
    );

    const geometry = new THREE.CylinderGeometry(1, 1, 1, 32).rotateX(
        Math.PI / 2
    );
    const material = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        wireframe: true,
    });

    cylinderObject = new THREE.Mesh(geometry, material);

    scene.add(cylinderObject);

    cylinderObject.scale.set(radius, radius, height);
    cylinderObject.lookAt(V);
    cylinderObject.position.set(centerPoint.x, centerPoint.y, centerPoint.z);

    centerPoint = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    );
    vector = new THREE.Vector3(V.x, V.y, V.z)
        .normalize()
        .divideScalar(2)
        .multiplyScalar(height);
    clearSelection();
    paintRange();
}

function applyCylindricalHeight(h) {
    clearRangeImages();
    cylinderObject.scale.set(1 / radius, 1 / radius, 1 / height);
    cylinderObject.scale.set(radius, radius, h);
    height = h;
    paintRange();
}

function cancelCylinder() {
    centerPoint = null;
    vector = null;
    scene.remove(cylinderObject);
    clearSelection();
    cylinderObject = null;
    clearRangeImages();
}

function paintRange() {
    let images = getAllImages();
    let rangeImages = new Set();
    const endPoint1 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).add(vector);
    const endPoint2 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).sub(vector);
    const infiniteVector = new THREE.Vector3(
        vector.x,
        vector.y,
        vector.z
    ).multiplyScalar(1000);
    const point1 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).add(infiniteVector);
    const point2 = new THREE.Vector3(
        centerPoint.x,
        centerPoint.y,
        centerPoint.z
    ).sub(infiniteVector);

    const segment = new THREE.Line3(endPoint1, endPoint2);
    const infiniteLine = new THREE.Line3(point1, point2);
    images.forEach((object) => {
        const P = new THREE.Vector3().copy(object.position);
        var lDistance = new THREE.Vector3();
        var sDistance = new THREE.Vector3();
        infiniteLine.closestPointToPoint(P, false, lDistance);
        segment.closestPointToPoint(P, false, sDistance);
        const lineDistance = lDistance.distanceTo(P).toFixed(5);
        const segmentDistance = sDistance.distanceTo(P).toFixed(5);
        if (lineDistance < radius && lineDistance == segmentDistance) {
            rangeImages.add(object);
        }
    });
    paintRangeImages(rangeImages);
}

export {
    openCylindricalImages,
    createCylinder,
    cancelCylinder,
    applyCylindricalRadius,
    setScene,
    applyCylindricalHeight,
};
