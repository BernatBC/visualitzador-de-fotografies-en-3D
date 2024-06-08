import * as THREE from "three";
import { getAllImages } from "./single-image-loader";

import { create, all } from "mathjs";

const math = create(all, {});

var scene;
var spheres = [];
var cylinders = [];
var planes = [];

const HOVER_COLOR = 0x66aaaa;
const NORMAL_COLOR = 0xaaaaaa;

function setScene(s) {
    scene = s;
}

function saveSphere(C, radius) {
    const geometry = new THREE.SphereGeometry(0.05, 10, 10);
    const material = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
    });
    const sphereObject = new THREE.Mesh(geometry, material);

    scene.add(sphereObject);

    sphereObject.position.set(C.x, C.y, C.z);
    sphereObject.userData.radius = radius;
    sphereObject.name = "Sphere" + spheres.length;
    sphereObject.visible = false;

    spheres.push(sphereObject);
}

function saveCylinder() {
    console.log("Saving");
}

function savePlane() {
    console.log("Saving");
}

function setFiguresVisibility(show) {
    if (spheres.length > 0) spheres.forEach((s) => (s.visible = show));
}

function openFigure(objects) {
    let object = firstFigure(objects);
    if (!object) return;
    if (spheres.length > 0)
        spheres.forEach((s) => {
            if (s.name == object.name) openSphericalImages(s.position, s.userData.radius);
            console.log("a");
        });
}

function hoveringFigure(objects) {
    let object = firstFigure(objects);
    if (!object) object = { name: "" };
    if (spheres.length > 0)
        spheres.forEach((s) => {
            if (s.name == object.name) s.material.color.setHex(HOVER_COLOR);
            else s.material.color.setHex(NORMAL_COLOR);
        });
}

function firstFigure(objects) {
    for (let i = 0; i < objects.length; i++) {
        const o = objects[i];
        if (o.object.name.startsWith("Sphere")) return o.object;
    }
    return null;
}

function openSphericalImages(C, radius) {
    let images = getAllImages();
    let json = [];

    images.forEach((object) => {
        let P_inter = object.userData.intersection;
        let P_real = object.position;
        if (P_inter == null) return;
        if (C.distanceTo(P_real) < radius) {
            const real_pos = getSphere2DCoords(P_real, C);
            const inter_pos = getSphere2DCoords(P_inter, C);
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
}

function getSphere2DCoords(P, C) {
    const V = new THREE.Vector3().subVectors(P, C).normalize();
    const phi = math.acos(V.y);
    const theta = math.atan2(V.x, V.z);
    return { x: theta, y: phi };
}

export {
    saveSphere,
    saveCylinder,
    savePlane,
    setFiguresVisibility,
    setScene,
    openFigure,
    hoveringFigure,
};
