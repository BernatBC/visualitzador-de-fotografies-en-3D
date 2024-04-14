import * as THREE from "three";
import { getSelectedImages, clearSelection, getAllImages } from "./interaction";
import { create, all } from "mathjs";

const math = create(all, {});

var abstractPlane;
var planeObject;
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
    planeObject = createPlaneFromPoints(
        images[0].position,
        images[1].position,
        images[2].position
    );
    clearSelection();
}

function createPlaneFromPoints(A, B, C) {
    abstractPlane = new THREE.Plane().setFromCoplanarPoints(A, B, C);

    const planeGeometry = new THREE.PlaneGeometry(10, 10);

    var coplanarPoint = abstractPlane.coplanarPoint(A);
    var focalPoint = new THREE.Vector3().addVectors(
        coplanarPoint,
        abstractPlane.normal
    );
    planeGeometry.lookAt(focalPoint);
    planeGeometry.translate(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);

    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        opacity: 0.2,
        transparent: true,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);
    return plane;
}

function cancelPlane() {
    scene.remove(planeObject);
    clearSelection();
    planeObject = null;
    abstractPlane = null;
}

function changePlaneDistance(d) {
    planeDistance = d;
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

export { setScene, createPlane, cancelPlane, changePlaneDistance, openPlane };
