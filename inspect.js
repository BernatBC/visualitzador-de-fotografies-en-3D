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

function saveSphere(C, r) {
    const geometry = new THREE.SphereGeometry(0.05, 10, 10);
    const material = new THREE.MeshBasicMaterial({
        color: NORMAL_COLOR,
    });
    const sphereObject = new THREE.Mesh(geometry, material);

    scene.add(sphereObject);

    sphereObject.position.set(C.x, C.y, C.z);
    sphereObject.userData.radius = r;
    sphereObject.name = "Sphere" + spheres.length;
    sphereObject.visible = false;
    spheres.push(sphereObject);
}

function saveCylinder(C, r, h, V) {
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 10).rotateX(Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
        color: NORMAL_COLOR,
    });

    const cylinderObject = new THREE.Mesh(geometry, material);

    scene.add(cylinderObject);

    cylinderObject.lookAt(V.normalize());
    cylinderObject.position.set(C.x, C.y, C.z);

    cylinderObject.userData.radius = r;
    cylinderObject.userData.height = h;
    cylinderObject.userData.vector = V;

    cylinderObject.name = "Cylinder" + cylinders.length;
    cylinderObject.visible = false;
    cylinders.push(cylinderObject);
}

function savePlane() {
    console.log("Saving");
}

function setFiguresVisibility(show) {
    if (spheres.length > 0) spheres.forEach((s) => (s.visible = show));
    if (cylinders.length > 0) cylinders.forEach((c) => (c.visible = show));
    if (planes.length > 0) planes.forEach((p) => (p.visible = show));
}

function openFigure(objects) {
    let object = firstFigure(objects);
    if (!object) return;
    if (object.name.startsWith("Sphere") && spheres.length > 0)
        spheres.forEach((s) => {
            if (s.name == object.name) openSphericalImages(s.position, s.userData.radius);
        });
    if (object.name.startsWith("Cylinder") && cylinders.length > 0)
        cylinders.forEach((c) => {
            if (c.name == object.name)
                openCylindricalImages(
                    c.userData.vector,
                    c.position,
                    c.userData.radius,
                    c.userData.height
                );
        });
    if (object.name.startsWith("Plane") && spheres.length > 0)
        planes.forEach((p) => {
            if (p.name == object.name) openSphericalImages(p.position, p.userData.radius);
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
    if (cylinders.length > 0)
        cylinders.forEach((c) => {
            if (c.name == object.name) c.material.color.setHex(HOVER_COLOR);
            else c.material.color.setHex(NORMAL_COLOR);
        });
    if (planes.length > 0)
        planes.forEach((p) => {
            if (p.name == object.name) p.material.color.setHex(HOVER_COLOR);
            else p.material.color.setHex(NORMAL_COLOR);
        });
}

function firstFigure(objects) {
    for (let i = 0; i < objects.length; i++) {
        const o = objects[i];
        if (
            o.object.name.startsWith("Sphere") ||
            o.object.name.startsWith("Cylinder") ||
            o.object.name.startsWith("Plane")
        )
            return o.object;
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

function openCylindricalImages(vector, centerPoint, radius, height) {
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
            const real_pos = getCylinder2DCoords(P_real, segment, originVector, centerPoint);
            const inter_pos = getCylinder2DCoords(P_inter, segment, originVector, centerPoint);
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

    window.open(url, "_blank");
}

function getCylinder2DCoords(P, segment, originVector, centerPoint) {
    var sProjected = new THREE.Vector3();
    segment.closestPointToPoint(P, true, sProjected);
    const pointVector = new THREE.Vector3().subVectors(sProjected, P).normalize();
    const x = originVector.angleTo(pointVector);
    const y = centerPoint.distanceTo(sProjected);
    return { x: x, y: -y };
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
