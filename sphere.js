import * as THREE from "three";
import {
    getAllImages,
    clearSelection,
    getSelectedImages,
    paintRangeImages,
    clearRangeImages,
} from "./interaction";
import { create, all } from "mathjs";
import { saveSphere } from "./inspect";

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
        let P_inter = object.userData.intersection;
        let P_real = object.position;
        if (P_inter == null) return;
        if (C.distanceTo(P_real) < radius) {
            const real_pos = get2DCoords(P_real);
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
    const url = "openseadragon.html?mode=spherical";

    window.open(url, "_blank");
    clearSelection();
}

function get2DCoords(P) {
    const V = new THREE.Vector3().subVectors(P, C).normalize();
    const phi = math.acos(V.y);
    const theta = math.atan2(V.x, V.z);
    return { x: -theta, y: phi }; // TODO: Check if it is correct
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

    const geometry = new THREE.SphereGeometry(1, 10, 10);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        wireframeLinewidth: 0.5,
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

function saveSphereToInspectMode() {
    saveSphere(C, radius);
}

export {
    openSphericalImages,
    createSphere,
    cancelSphere,
    applySphericalRadius,
    setScene,
    saveSphereToInspectMode,
};
