import * as THREE from "three";
import { render, renderer } from "./main.js";
import { getAllImages } from "./single-image-loader.js";
import { createPlane, setScene as setPlaneScene } from "./plane.js";
import { createSphere, setScene as setSphereScene } from "./sphere.js";
import { createCylinder, setScene as setCylinderScene } from "./cylinder.js";
import {
    setSphereSettings,
    setCylinderSettings,
    setPlaneSettings,
    setMultiSettings,
    resetUI,
} from "./panel.js";
import { openFigure, hoveringFigure } from "./inspect.js";

import { create, all } from "mathjs";

const math = create(all, {});

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var hover = undefined;
var mDragging = false;
var mDown = false;
var camera;
var scene;
var controls;
var mode = "multi";
var authoringMode = true;

const HOVER_COLOR = 0xccffff;
const SELECTION_COLOR = 0xd6b4fc;
const NEUTRAL_COLOR = 0xffffff;
const RANGE_COLOR = 0xfcae1e;

var imagesSelected = new Set();
var rangeImages = new Set();

function addInteraction(cam, sce, cntrls) {
    camera = cam;
    scene = sce;
    controls = cntrls;
    setPlaneScene(sce);
    setSphereScene(sce);
    setCylinderScene(sce);

    // OBRIR IMATGES EN OPENSEADRAGON
    window.addEventListener("mousedown", function () {
        mDown = true;
    });

    window.addEventListener("mousemove", function () {
        if (mDown) mDragging = true;
    });

    window.addEventListener("mouseup", function () {
        if (mDragging === false) onClick(camera);
        mDown = false;
        mDragging = false;
    });

    window.addEventListener("pointermove", onHover);

    window.addEventListener("storage", (event) => {
        console.log("navigate");
        let images = getAllImages();
        images.forEach((i) => {
            if (i.name != localStorage.getItem("navigate")) return;
            camera.position.copy(i.position);
            let target = new THREE.Vector3().copy(i.position).add(i.userData.direction);
            controls.target.set(target.x, target.y, target.z);
        });
        localStorage.setItem("navigate", null);
    });
}

function onClick() {
    event.preventDefault();
    // Avoid clicking images behind GUI
    if (event.target.tagName !== "CANVAS") return;
    // get x,y coords into canvas where click occurred
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    mouse.x = (x / event.target.clientWidth) * 2 - 1;
    mouse.y = -(y / event.target.clientHeight) * 2 + 1;

    /*mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    */
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length == 0) {
        console.log("No intersection detected.");
        return;
    }

    if (!authoringMode) {
        openFigure(intersects);
        render();
        return;
    }

    var object = firstImage(intersects);
    if (object == null) return;

    if (event.button == 0) {
        const url = "openseadragon.html?mode=single&image=" + encodeURIComponent(object.name);
        window.open(url, "_blank");
        clearSelection();
    } else if (!rangeImages.has(object)) {
        if (imagesSelected.has(object)) {
            imagesSelected.delete(object);
            object.material.color.setHex(HOVER_COLOR);
            if (mode === "multi" && imagesSelected.size == 0) resetUI();
        } else {
            imagesSelected.add(object);
            object.material.color.setHex(SELECTION_COLOR);
            if (mode === "sphere" && imagesSelected.size == 1) {
                createSphere();
                setSphereSettings();
            } else if (mode === "cylinder" && imagesSelected.size == 2) {
                createCylinder();
                setCylinderSettings();
            } else if (mode === "plane" && imagesSelected.size == 3) {
                createPlane();
                setPlaneSettings();
            } else if (mode === "multi") setMultiSettings();
        }
    }

    render();
}

function openImagesToOpenSeaDragon() {
    if (imagesSelected.size == 0) return;
    let jsonContent = JSON.stringify(createJSON(imagesSelected));
    localStorage.setItem("images", jsonContent);
    const url = "openseadragon.html?mode=multiple";
    window.open(url, "_blank");
    clearSelection();
}

function clearSelection() {
    imagesSelected.forEach((image_object) => image_object.material.color.setHex(NEUTRAL_COLOR));
    imagesSelected.clear();
}

function hoverIn(image_object) {
    if (!imagesSelected.has(image_object) && !rangeImages.has(image_object))
        image_object.material.color.setHex(HOVER_COLOR);
    hover = image_object;
}

function hoverOut() {
    if (!imagesSelected.has(hover) && !rangeImages.has(hover))
        hover.material.color.setHex(NEUTRAL_COLOR);
    hover = undefined;
}

function onHover() {
    if (mDragging) return;
    event.preventDefault();
    // Avoid clicking images behind GUI
    if (event.target.tagName !== "CANVAS") return;

    // get x,y coords into canvas where click occurred
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    mouse.x = (x / event.target.clientWidth) * 2 - 1;
    mouse.y = -(y / event.target.clientHeight) * 2 + 1;

    /*
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / (window.innerHeight)) * 2 + 1;
    */
    //console.log(mouse);
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
        if (!authoringMode) {
            hoveringFigure(intersects);
            render();
            return;
        }
        var object = firstImage(intersects);
        if (object != null) {
            // New Hover
            if (hover === undefined) hoverIn(object);
            // Replace hover
            else if (hover.name !== object.name) {
                hoverOut();
                hoverIn(object);
            }
        }
        // Hovering a non-image object
        else if (hover !== undefined) hoverOut();
    }
    //No hovering any image
    else if (hover !== undefined) hoverOut();

    render();
}

function createJSON(objectArray) {
    let json = [];
    const C = camera.position;

    objectArray.forEach((object) => {
        const real_pos = get2DCoords(C, object.position);
        //if (object.userData.intersection == null) intersection_pos = real_pos;
        const intersection_pos = get2DCoords(C, object.userData.intersection);
        json.push({
            name: object.name,
            x_real: real_pos.x,
            y_real: real_pos.y,
            x_inter: intersection_pos.x,
            y_inter: intersection_pos.y,
            isLandscape: object.userData.isLandscape,
            heightToWidthRatio: object.userData.heightToWidthRatio,
            zoom: object.userData.zoom,
        });
    });
    console.log(json);
    return json;
}

function get2DCoords(C, P) {
    const V = new THREE.Vector3().subVectors(P, C).normalize();
    const phi = math.acos(V.y);
    const theta = math.atan2(V.x, V.z);
    return { x: theta, y: phi };
}

function getSelectedImages() {
    return imagesSelected;
}

function paintRangeImages(images) {
    rangeImages = images;
    rangeImages.forEach((object) => {
        object.material.color.setHex(RANGE_COLOR);
    });
}

function clearRangeImages() {
    rangeImages.forEach((object) => {
        if (imagesSelected.has(object)) object.material.color.setHex(SELECTION_COLOR);
        else object.material.color.setHex(NEUTRAL_COLOR);
    });
    rangeImages = new Set();
}

function firstImage(objects) {
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].object.name.startsWith("Sant Quirze de Pedret by Zones"))
            return objects[i].object;
    }
    return null;
}

function setSelectionMode(m) {
    mode = m;
}

function setAuthoringMode(m) {
    authoringMode = m;
}

export {
    addInteraction,
    openImagesToOpenSeaDragon,
    clearSelection,
    getSelectedImages,
    getAllImages,
    clearRangeImages,
    paintRangeImages,
    setSelectionMode,
    setAuthoringMode,
};
