import * as THREE from "three";
import { getSelectedImages, clearSelection, getAllImages } from "./interaction";
import { create, all } from "mathjs";

const math = create(all, {});

var abstractPlane;
var boxObject;
var planeHeight = 1;
var planeWidth = 1;
var planeDistance = 0.2;
var scene;

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
    boxObject = createPlaneFromPoints(
        images[0].position,
        images[1].position,
        images[2].position
    );
    clearSelection();
}

function createPlaneFromPoints(A, B, C) {
    abstractPlane = new THREE.Plane().setFromCoplanarPoints(A, B, C);

    var coplanarPoint = abstractPlane.coplanarPoint(new THREE.Vector3(A));
    var focalPoint = new THREE.Vector3().addVectors(
        coplanarPoint,
        abstractPlane.normal
    );

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
    boxGeometry.lookAt(focalPoint);
    const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        wireframe: true,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);
    box.position.set(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);
    //box.scale.set(planeDistance, planeHeight, planeWidth);

    return box;
}

function cancelPlane() {
    scene.remove(boxObject);
    clearSelection();
    boxObject = null;
    abstractPlane = null;
}

function changePlaneDistance(d) {
    boxObject.scale.set(1 / planeDistance, 1 / planeHeight, 1 / planeWidth);
    boxObject.scale.set(d, planeHeight, planeWidth);

    planeDistance = d;
}

function changePlaneHeight(h) {
    boxObject.scale.set(1 / planeDistance, 1 / planeHeight, 1 / planeWidth);
    boxObject.scale.set(planeDistance, h, planeWidth);

    planeHeight = h;
}

function changePlaneWidth(w) {
    boxObject.scale.set(1 / planeDistance, 1 / planeHeight, 1 / planeWidth);
    boxObject.scale.set(planeDistance, planeHeight, w);

    planeWidth = w;
}

function openPlane() {
    console.log("opening to openseadragon");
    let images = getAllImages();
    let json = [];
    images.forEach((object) => {
        const P = object.position;
        var P2 = new THREE.Vector3();
        abstractPlane.projectPoint(P, P2);
        if (P.distanceTo(P2) < planeDistance) {
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
    const url = "openseadragon.html?mode=plane";

    window.open(url, "_blank");
    //cancelPlane();
}

export {
    setScene,
    createPlane,
    cancelPlane,
    changePlaneDistance,
    changePlaneHeight,
    changePlaneWidth,
    openPlane,
};
