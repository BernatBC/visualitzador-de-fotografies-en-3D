import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { setSize, setOffset, setWireframe } from "./single-image-loader.js";
import { openImagesToOpenSeaDragon, clearSelection, setFigureBoolean } from "./interaction.js";

import { applySphericalRadius, openSphericalImages, cancelSphere, createSphere } from "./sphere.js";

import {
    createPlane,
    cancelPlane,
    changePlaneDistance,
    changePlaneHeight,
    changePlaneWidth,
    openPlane,
} from "./plane.js";

import {
    createCylinder,
    cancelCylinder,
    applyCylindricalRadius,
    openCylindricalImages,
    applyCylindricalHeight,
} from "./cylinder.js";

const panel = new GUI({ width: 290 });

const folder1 = panel.addFolder("Image Settings");
const folder2 = panel.addFolder("Individual Selection");
const folder3 = panel.addFolder("Sphere");
const folder4 = panel.addFolder("Plane");
const folder5 = panel.addFolder("Cylinder");

function createPanel() {
    let settings1 = {
        "Image size": 1.0,
        "Image separation": 0.2,
        "Image wireframe": true,
    };

    let settings2 = {
        "Clear Selection": function () {
            clearSelection();
            setSelection(0);
        },
        "Open to OpenSeaDragon": function () {
            openImagesToOpenSeaDragon();
            setSelection(0);
        },
    };

    let settings3 = {
        "Create Sphere": function () {
            createSphere();
            showController("Sphere", "Radius");
            showController("Sphere", "Open to OpenSeaDragon");
            showController("Sphere", "Cancel");
            hideController("Sphere", "Create Sphere");
            hideFolder("Individual Selection");
            hideFolder("Plane");
            hideFolder("Cylinder");
            setFigureBoolean(true);
        },
        "Open to OpenSeaDragon": function () {
            openSphericalImages();
        },
        Radius: 0.5,
        Cancel: function () {
            cancelSphere();
            hideController("Sphere", "Radius");
            hideController("Sphere", "Open to OpenSeaDragon");
            hideController("Sphere", "Cancel");
            showController("Sphere", "Create Sphere");
            setSelection(0);
            setFigureBoolean(false);
        },
    };

    let settings4 = {
        "Create Plane": function () {
            createPlane();
            showController("Plane", "Width");
            showController("Plane", "Height");
            showController("Plane", "Max distance");
            showController("Plane", "Open to OpenSeaDragon");
            showController("Plane", "Cancel");
            hideController("Plane", "Create Plane");
            hideFolder("Individual Selection");
            hideFolder("Sphere");
            hideFolder("Cylinder");
            setFigureBoolean(true);
        },
        Cancel: function () {
            cancelPlane();
            hideController("Plane", "Width");
            hideController("Plane", "Height");
            hideController("Plane", "Max distance");
            hideController("Plane", "Open to OpenSeaDragon");
            hideController("Plane", "Cancel");
            showController("Plane", "Create Plane");
            setSelection(0);
            setFigureBoolean(false);
        },
        Width: 1,
        Height: 1,
        "Max distance": 0.1,
        "Open to OpenSeaDragon": function () {
            openPlane();
        },
    };

    let settings5 = {
        "Create Cylinder": function () {
            createCylinder();
            showController("Cylinder", "Radius");
            showController("Cylinder", "Height");
            showController("Cylinder", "Open to OpenSeaDragon");
            showController("Cylinder", "Cancel");
            hideController("Cylinder", "Create Cylinder");
            hideFolder("Individual Selection");
            hideFolder("Sphere");
            hideFolder("Plane");
            setFigureBoolean(true);
        },
        "Open to OpenSeaDragon": function () {
            openCylindricalImages();
        },
        Radius: 0.5,
        Height: 1.0,
        Cancel: function () {
            cancelCylinder();
            hideController("Cylinder", "Radius");
            hideController("Cylinder", "Height");
            hideController("Cylinder", "Open to OpenSeaDragon");
            hideController("Cylinder", "Cancel");
            showController("Cylinder", "Create Cylinder");
            setSelection(0);
            setFigureBoolean(false);
        },
    };

    folder1.add(settings1, "Image size", 0.0, 5.0, 0.01).onChange(setSize);
    folder1.add(settings1, "Image separation", 0, 2.0, 0.01).onChange(setOffset);
    folder1.add(settings1, "Image wireframe").onChange(setWireframe);

    folder2.add(settings2, "Open to OpenSeaDragon");
    folder2.add(settings2, "Clear Selection");

    folder3.add(settings3, "Create Sphere");
    folder3.add(settings3, "Radius", 0.0, 5.0, 0.01).onChange(applySphericalRadius);
    folder3.add(settings3, "Open to OpenSeaDragon");
    folder3.add(settings3, "Cancel");

    folder4.add(settings4, "Create Plane");
    folder4.add(settings4, "Width", 0.0, 10.0, 0.01).onChange(changePlaneWidth);
    folder4.add(settings4, "Height", 0.0, 10.0, 0.01).onChange(changePlaneHeight);
    folder4.add(settings4, "Max distance", 0.0, 5.0, 0.01).onChange(changePlaneDistance);
    folder4.add(settings4, "Open to OpenSeaDragon");
    folder4.add(settings4, "Cancel");

    folder5.add(settings5, "Create Cylinder");
    folder5.add(settings5, "Radius", 0.0, 5.0, 0.01).onChange(applyCylindricalRadius);
    folder5.add(settings5, "Height", 0.0, 5.0, 0.01).onChange(applyCylindricalHeight);
    folder5.add(settings5, "Open to OpenSeaDragon");
    folder5.add(settings5, "Cancel");

    // Initialize panel
    hideFolder("Individual Selection");
    hideFolder("Sphere");
    hideFolder("Plane");
    hideFolder("Cylinder");
    hideController("Sphere", "Radius");
    hideController("Sphere", "Open to OpenSeaDragon");
    hideController("Sphere", "Cancel");
    hideController("Plane", "Width");
    hideController("Plane", "Height");
    hideController("Plane", "Max distance");
    hideController("Plane", "Open to OpenSeaDragon");
    hideController("Plane", "Cancel");
    hideController("Cylinder", "Radius");
    hideController("Cylinder", "Height");
    hideController("Cylinder", "Open to OpenSeaDragon");
    hideController("Cylinder", "Cancel");
}

function setSliderValue(folder, slider_name, value) {
    panel.children.forEach((c) => {
        if (c._title !== folder) return;
        for (var i = 0; i < c.controllers.length; i++)
            if (c.controllers[i].property === slider_name) c.controllers[i].setValue(value);
    });
}

function hideController(folder, slider_name) {
    panel.children.forEach((c) => {
        if (c._title !== folder) return;
        for (var i = 0; i < c.controllers.length; i++)
            if (c.controllers[i].property === slider_name) c.controllers[i].hide();
    });
}

function hideFolder(folder) {
    panel.children.forEach((c) => {
        if (c._title !== folder) return;
        c.hide();
    });
}

function showController(folder, slider_name) {
    panel.children.forEach((c) => {
        if (c._title !== folder) return;
        for (var i = 0; i < c.controllers.length; i++)
            if (c.controllers[i].property === slider_name) c.controllers[i].show();
    });
}

function showFolder(folder) {
    panel.children.forEach((c) => {
        if (c._title !== folder) return;
        c.show();
    });
}

function setSelection(number) {
    console.log("Selected: " + number);
    if (number === 0) {
        hideFolder("Individual Selection");
        hideFolder("Sphere");
        hideFolder("Plane");
        hideFolder("Cylinder");
    } else if (number === 1) {
        showFolder("Individual Selection");
        showFolder("Sphere");
        hideFolder("Plane");
        hideFolder("Cylinder");
    } else if (number === 2) {
        showFolder("Individual Selection");
        hideFolder("Sphere");
        hideFolder("Plane");
        showFolder("Cylinder");
    } else if (number === 3) {
        showFolder("Individual Selection");
        hideFolder("Sphere");
        showFolder("Plane");
        hideFolder("Cylinder");
    } else {
        showFolder("Individual Selection");
        hideFolder("Sphere");
        hideFolder("Plane");
        hideFolder("Cylinder");
    }
}

export { createPanel, setSliderValue, setSelection };
