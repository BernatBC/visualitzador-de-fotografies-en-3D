import * as THREE from "three";
import {
    getAllImages,
    clearSelection,
    getSelectedImages,
    paintRangeImages,
    clearRangeImages,
} from "./interaction";
import { setSliderValue } from "./panel";
import { saveCylinder } from "./inspect";

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

    const V = new THREE.Vector3(vector.x, vector.y, vector.z).multiplyScalar(height / 2);
    const endPoint1 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).add(V);
    const endPoint2 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).sub(V);
    const infiniteVector = new THREE.Vector3(V.x, V.y, V.z).multiplyScalar(1000);
    const point1 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).add(
        infiniteVector
    );
    const point2 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).sub(
        infiniteVector
    );

    const segment = new THREE.Line3(endPoint1, endPoint2);
    const infiniteLine = new THREE.Line3(point1, point2);

    var originProjected = new THREE.Vector3();
    const origin = new THREE.Vector3(0, 0, 0);
    infiniteLine.closestPointToPoint(origin, false, originProjected);
    const originVector = new THREE.Vector3().subVectors(originProjected, origin).normalize();

    images.forEach((object) => {
        const P_real = new THREE.Vector3().copy(object.position);
        const P_inter = new THREE.Vector3().copy(object.userData.intersection);
        if (P_inter == null) return;

        var lProjected = new THREE.Vector3();
        var sProjected = new THREE.Vector3();
        infiniteLine.closestPointToPoint(P_real, true, lProjected);
        segment.closestPointToPoint(P_real, true, sProjected);
        const lineDistance = lProjected.distanceTo(P_real).toFixed(5);
        const segmentDistance = sProjected.distanceTo(P_real).toFixed(5);
        if (lineDistance < radius && lineDistance == segmentDistance) {
            const real_pos = get2DCoords(P_real, segment, originVector);
            const inter_pos = get2DCoords(P_inter, segment, originVector);
            json.push({
                name: object.name,
                x_real: real_pos.x,
                y_real: real_pos.y,
                x_inter: inter_pos.x,
                y_inter: inter_pos.y,
                isLandscape: object.userData.isLandscape,
                heightToWidthRatio: object.userData.heightToWidthRatio,
                zoom: object.userData.zoom,
            });
        }
    });

    let jsonContent = JSON.stringify(json);
    localStorage.setItem("images", jsonContent);
    const url = "openseadragon.html?mode=cylindrical";

    window.open(url, "blank");
    clearSelection();
}

function get2DCoords(P, segment, originVector) {
    var sProjected = new THREE.Vector3();
    segment.closestPointToPoint(P, true, sProjected);
    const pointVector = new THREE.Vector3().subVectors(sProjected, P).normalize();
    const x = originVector.angleTo(pointVector);
    const y = centerPoint.distanceTo(sProjected);
    return { x: x, y: -y };
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

    const V = new THREE.Vector3().subVectors(P2, P1);
    height = V.length();

    centerPoint = new THREE.Vector3((P1.x + P2.x) / 2, (P1.y + P2.y) / 2, (P1.z + P2.z) / 2);

    const geometry = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true).rotateX(Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        wireframeLinewidth: 0.5,
    });

    cylinderObject = new THREE.Mesh(geometry, material);

    scene.add(cylinderObject);

    cylinderObject.scale.set(radius, radius, height);
    cylinderObject.lookAt(V.normalize());
    cylinderObject.position.set(centerPoint.x, centerPoint.y, centerPoint.z);

    centerPoint = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z);
    vector = new THREE.Vector3(V.x, V.y, V.z).normalize();
    clearSelection();
    paintRange();
    setSliderValue("Cylinder", "Height", height);
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
    const V = new THREE.Vector3(vector.x, vector.y, vector.z).multiplyScalar(height / 2);
    const endPoint1 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).add(V);
    const endPoint2 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).sub(V);
    const infiniteVector = new THREE.Vector3(V.x, V.y, V.z).multiplyScalar(1000);
    const point1 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).add(
        infiniteVector
    );
    const point2 = new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z).sub(
        infiniteVector
    );

    const segment = new THREE.Line3(endPoint1, endPoint2);
    const infiniteLine = new THREE.Line3(point1, point2);
    images.forEach((object) => {
        const P = new THREE.Vector3().copy(object.position);
        var lProjected = new THREE.Vector3();
        var sProjected = new THREE.Vector3();
        infiniteLine.closestPointToPoint(P, true, lProjected);
        segment.closestPointToPoint(P, true, sProjected);
        const lineDistance = lProjected.distanceTo(P).toFixed(5);
        const segmentDistance = sProjected.distanceTo(P).toFixed(5);
        if (lineDistance < radius && lineDistance == segmentDistance) {
            rangeImages.add(object);
        }
    });
    paintRangeImages(rangeImages);
}

function saveCylinderToInspectMode() {
    saveCylinder(centerPoint, radius, height, vector);
}

export {
    openCylindricalImages,
    createCylinder,
    cancelCylinder,
    applyCylindricalRadius,
    setScene,
    applyCylindricalHeight,
    saveCylinderToInspectMode,
};
