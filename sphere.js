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
var C;
var scene;
var sphereObject;

function setScene(sce) {
    scene = sce;
}

function openSphericalImages() {
    let images = getAllImages();
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
    clearSelection();
}

function applySphericalRadius(r) {
    clearRangeImages();
    sphereObject.scale.set(1 / radius, 1 / radius, 1 / radius);
    sphereObject.scale.set(r, r, r);
    radius = r;
    paintRange();
}

function createSphere() {
    var imagesSelected = getSelectedImages();
    if (imagesSelected.size != 1) {
        console.log("You need to select exactly 1 image");
        return;
    }
    const images = Array.from(imagesSelected);
    C = images[0].position;

    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        linewidth: 0.1,
    });
    sphereObject = new THREE.Mesh(geometry, material);

    scene.add(sphereObject);

    sphereObject.scale.set(radius, radius, radius);
    sphereObject.position.set(C.x, C.y, C.z);

    clearSelection();
    paintRange();
}

function cancelSphere() {
    C = null;
    scene.remove(sphereObject);
    clearSelection();
    sphereObject = null;
    clearRangeImages();
}

function paintRange() {
    let images = getAllImages();
    let rangeImages = new Set();
    images.forEach((object) => {
        const P = object.position;
        if (C.distanceTo(P) < radius) {
            rangeImages.add(object);
        }
    });
    paintRangeImages(rangeImages);
}

export { openSphericalImages, createSphere, cancelSphere, applySphericalRadius, setScene };
