import * as THREE from "three";
import { getAllImages, clearSelection, getSelectedImages } from "./interaction";
import { create, all } from "mathjs";

const math = create(all, {});

var radius = 0.5;

var P;

var scene;
var cylinderObject;

function setScene(sce) {
    scene = sce;
}

function openCylindricalImages() {
    console.log("opening");
    /*let images = getAllImages();
    let json = [];

    images.forEach((object) => {
        const P = object.position;
        if (C.distanceTo(P) < radius) {
            const V = new THREE.Vector3().subVectors(P, C).normalize();
            const phi = math.acos(V.y);
            const theta = math.atan2(V.x, V.z);
            json.push({
                name: object.name,
                x: theta,
                y: phi,
                height: object.geometry.parameters.height,
            });
        }
    });

    let jsonContent = JSON.stringify(json);
    localStorage.setItem("images", jsonContent);
    const url = "openseadragon.html?mode=spherical";

    window.open(url, "_blank");
    clearSelection();*/
}

function applyCylindricalRadius(r) {
    cylinderObject.scale.set(1 / radius, 1 / radius, 1);
    cylinderObject.scale.set(r, r, 1);
    radius = r;
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
    const h = P1.distanceTo(P2);

    const V = new THREE.Vector3().subVectors(P2, P1).normalize();

    P = new THREE.Vector3(
        (P1.x + P2.x) / 2,
        (P1.y + P2.y) / 2,
        (P1.z + P2.z) / 2
    );

    const geometry = new THREE.CylinderGeometry(1, 1, h, 32).rotateX(
        Math.PI / 2
    );
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        opacity: 0.2,
        transparent: true,
    });

    cylinderObject = new THREE.Mesh(geometry, material);

    scene.add(cylinderObject);

    cylinderObject.scale.set(radius, radius, 1);
    cylinderObject.lookAt(V);
    cylinderObject.position.set(P.x, P.y, P.z);

    clearSelection();
}

function cancelCylinder() {
    P = null;
    scene.remove(cylinderObject);
    clearSelection();
    cylinderObject = null;
}

export {
    openCylindricalImages,
    createCylinder,
    cancelCylinder,
    applyCylindricalRadius,
    setScene,
};
