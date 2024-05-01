import * as THREE from "three";
import { render } from "./main.js";
import { getAllImages } from "./single-image-loader.js";
import { setScene as setPlaneScene } from "./plane.js";
import { setScene as setSphereScene } from "./sphere.js";
import { setScene as setCylinderScene } from "./cylinder.js";
import { create, all } from "mathjs";

const math = create(all, {});

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var hover = undefined;
var mDragging = false;
var mDown = false;
var camera;
var scene;

const HOVER_COLOR = 0xccffff;
const SELECTION_COLOR = 0xd6b4fc;
const NEUTRAL_COLOR = 0xffffff;
const RANGE_COLOR = 0xfcae1e;

var imagesSelected = new Set();
var rangeImages = new Set();

function addInteraction(cam, sce) {
    camera = cam;
    scene = sce;
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
}

function onClick() {
    event.preventDefault();
    // Avoid clicking images behind GUI
    if (event.target.tagName === "DIV") return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length == 0) return;

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
        } else {
            imagesSelected.add(object);
            object.material.color.setHex(SELECTION_COLOR);
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
    if (imagesSelected.has(image_object) || rangeImages.has(image_object)) return;
    image_object.material.color.setHex(HOVER_COLOR);
    hover = image_object;
}

function hoverOut() {
    if (imagesSelected.has(hover) || rangeImages.has(hover)) return;
    hover.material.color.setHex(NEUTRAL_COLOR);
    hover = undefined;
}

function onHover() {
    if (mDragging) return;
    event.preventDefault();
    // Avoid clicking images behind GUI
    if (event.target.tagName === "DIV") return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
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
        const P = object.position;
        const V = new THREE.Vector3().subVectors(P, C).normalize();
        const phi = math.acos(V.y);
        const theta = math.atan2(V.x, V.z);
        json.push({
            name: object.name,
            x: theta,
            y: phi,
            height: object.geometry.parameters.height,
        });
    });
    console.log(json);
    return json;
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

export {
    addInteraction,
    openImagesToOpenSeaDragon,
    clearSelection,
    getSelectedImages,
    getAllImages,
    clearRangeImages,
    paintRangeImages,
};
