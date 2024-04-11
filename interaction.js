import * as THREE from "three";
import { render } from "./main.js";
import { getAllImages } from "./single-image-loader.js";
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

var radius = 2;

var imagesSelected = new Set();

function addInteraction(cam, sce) {
    camera = cam;
    scene = sce;

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
    if (intersects.length > 0) {
        var object = intersects[0].object;
        if (object.name.startsWith("Sant Quirze de Pedret by Zones")) {
            if (event.button == 0) {
                const url =
                    "openseadragon.html?mode=single&image=" +
                    encodeURIComponent(object.name);
                window.open(url, "_blank");
                clearSelection();
            } else {
                if (imagesSelected.has(object)) {
                    imagesSelected.delete(object);
                    object.material.color.setHex(HOVER_COLOR);
                } else {
                    imagesSelected.add(object);
                    object.material.color.setHex(SELECTION_COLOR);
                }
            }
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
    imagesSelected.forEach((image_object) =>
        image_object.material.color.setHex(NEUTRAL_COLOR)
    );
    imagesSelected.clear();
}

function hoverIn(image_object) {
    if (!imagesSelected.has(image_object))
        image_object.material.color.setHex(HOVER_COLOR);
    hover = image_object;
}

function hoverOut() {
    if (!imagesSelected.has(hover)) hover.material.color.setHex(NEUTRAL_COLOR);
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
        var object = intersects[0].object;
        if (object.name.startsWith("Sant Quirze de Pedret by Zones")) {
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
            phi: phi,
            theta: theta,
            height: object.geometry.parameters.height,
        });
    });
    console.log(json);
    return json;
}

function openSphericalImages() {
    let images = getAllImages();
    let json = [];
    const C = camera.position;
    images.forEach((object) => {
        const P = object.position;
        if (C.distanceTo(P) < radius) {
            const V = new THREE.Vector3().subVectors(P, C).normalize();
            const phi = math.acos(V.y);
            const theta = math.atan2(V.x, V.z);
            json.push({
                name: object.name,
                phi: phi,
                theta: theta,
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
    radius = r;
}

export {
    addInteraction,
    openImagesToOpenSeaDragon,
    clearSelection,
    openSphericalImages,
    applySphericalRadius,
};
