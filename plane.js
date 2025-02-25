import * as THREE from "three";
import {
    getSelectedImages,
    clearSelection,
    getAllImages,
    paintRangeImages,
    clearRangeImages,
} from "./interaction";
import { savePlane } from "./inspect";

import { create, all } from "mathjs";

const math = create(all, {});

var abstractPlane;
var boxObject;
var planeHeight = 1;
var planeWidth = 1;
var planeDistance = 0.1;
var scene;
var centerPoint;

var N;
var t;
var b;

function setScene(sce) {
    scene = sce;
}

function createPlane() {
    var imagesSelected = getSelectedImages();
    if (imagesSelected.size != 3) {
        console.log("You need to select exactly 3 images");
        return;
    }
    const images = Array.from(imagesSelected);
    boxObject = createPlaneFromPoints(images[0].position, images[1].position, images[2].position);
    clearSelection();
    paintRange();
}

function createPlaneFromPoints(A, B, C) {
    abstractPlane = new THREE.Plane().setFromCoplanarPoints(A, B, C);

    centerPoint = new THREE.Vector3(
        (A.x + B.x + C.x) / 3,
        (A.y + B.y + C.y) / 3,
        (A.z + B.z + C.z) / 3
    );

    N = new THREE.Vector3().copy(abstractPlane.normal).normalize();
    t = new THREE.Vector3().copy(N).cross(new THREE.Vector3(0, 1, 0)).normalize();
    b = new THREE.Vector3().copy(N).cross(t).normalize();

    const coordsA = worldCoordsToPlaneCoords(A);
    const coordsB = worldCoordsToPlaneCoords(B);
    const coordsC = worldCoordsToPlaneCoords(C);
    planeWidth =
        math.max(coordsA.x, coordsB.x, coordsC.x) - math.min(coordsA.x, coordsB.x, coordsC.x);
    planeHeight =
        math.max(coordsA.y, coordsB.y, coordsC.y) - math.min(coordsA.y, coordsB.y, coordsC.y);

    const centerX =
        (math.max(coordsA.x, coordsB.x, coordsC.x) + math.min(coordsA.x, coordsB.x, coordsC.x)) / 2;
    const centerY =
        (math.max(coordsA.y, coordsB.y, coordsC.y) + math.min(coordsA.y, coordsB.y, coordsC.y)) / 2;

    centerPoint = planeCoordsToWorldCoords(new THREE.Vector2(centerX, centerY));

    var coplanarPoint = abstractPlane.coplanarPoint(new THREE.Vector3().copy(centerPoint));
    var focalPoint = new THREE.Vector3().addVectors(coplanarPoint, abstractPlane.normal);

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
    const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        wireframeLinewidth: 0.5,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);

    scene.add(box);
    box.lookAt(focalPoint);
    box.position.set(centerPoint.x, centerPoint.y, centerPoint.z);
    box.scale.set(planeWidth, planeHeight, planeDistance);

    return box;
}

function cancelPlane() {
    scene.remove(boxObject);
    clearSelection();
    boxObject = null;
    abstractPlane = null;
    centerPoint = null;
    N = null;
    t = null;
    b = null;
    clearRangeImages();
}

function changePlaneDistance(d) {
    clearRangeImages();
    boxObject.scale.set(1 / planeWidth, 1 / planeHeight, 1 / planeDistance);
    boxObject.scale.set(planeWidth, planeHeight, d);

    planeDistance = d;
    paintRange();
}

function changePlaneHeight(h) {
    clearRangeImages();
    boxObject.scale.set(1 / planeWidth, 1 / planeHeight, 1 / planeDistance);
    boxObject.scale.set(planeWidth, h, planeDistance);

    planeHeight = h;
    paintRange();
}

function changePlaneWidth(w) {
    clearRangeImages();
    boxObject.scale.set(1 / planeWidth, 1 / planeHeight, 1 / planeDistance);
    boxObject.scale.set(w, planeHeight, planeDistance);

    planeWidth = w;
    paintRange();
}

function openPlane() {
    console.log("opening to openseadragon");
    let images = getAllImages();
    let json = [];

    images.forEach((object) => {
        const P_real = object.position;
        const P_inter = object.userData.intersection;
        if (P_inter == null) return;
        var P2 = new THREE.Vector3();
        abstractPlane.projectPoint(P_real, P2);

        const real_pos = get2DCoords(P_real);

        if (
            P_real.distanceTo(P2) < planeDistance / 2 &&
            math.abs(real_pos.x) < planeWidth / 2 &&
            math.abs(real_pos.y) < planeHeight / 2
        ) {
            const inter_pos = get2DCoords(P_inter);
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
    const url = "openseadragon.html?mode=plane";

    window.open(url, "blank");
    //cancelPlane();
}

function get2DCoords(P) {
    var P2 = new THREE.Vector3();
    abstractPlane.projectPoint(P, P2);
    return worldCoordsToPlaneCoords(P);
}

function worldCoordsToPlaneCoords(P) {
    const V = new THREE.Vector3().subVectors(P, centerPoint);
    const tv = new THREE.Vector3().copy(V).dot(t);
    const bv = new THREE.Vector3().copy(V).dot(b);
    return { x: -tv, y: bv };
}

function planeCoordsToWorldCoords(P) {
    let V = new THREE.Vector3().copy(t).multiplyScalar(-P.x);
    const B = new THREE.Vector3().copy(b).multiplyScalar(P.y);
    V.add(B);
    V.add(centerPoint);

    return V;
}

function paintRange() {
    let images = getAllImages();
    let rangeImages = new Set();

    images.forEach((object) => {
        const P = object.position;
        var P2 = new THREE.Vector3();
        abstractPlane.projectPoint(P, P2);

        const coords = worldCoordsToPlaneCoords(P);

        if (
            P.distanceTo(P2) < planeDistance / 2 &&
            math.abs(coords.x) < planeWidth / 2 &&
            math.abs(coords.y) < planeHeight / 2
        )
            rangeImages.add(object);
    });
    paintRangeImages(rangeImages);
}

function savePlaneToInspectMode() {
    savePlane(abstractPlane, planeHeight, planeWidth, planeDistance, centerPoint, t, b);
}

export {
    setScene,
    createPlane,
    cancelPlane,
    changePlaneDistance,
    changePlaneHeight,
    changePlaneWidth,
    openPlane,
    savePlaneToInspectMode,
};
