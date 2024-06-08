import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { setSize, setOffset, setWireframe, setImageVisibility } from "./single-image-loader.js";
import {
    openImagesToOpenSeaDragon,
    clearSelection,
    setSelectionMode,
    setAuthoringMode,
} from "./interaction.js";

import {
    applySphericalRadius,
    openSphericalImages,
    cancelSphere,
    saveSphereToInspectMode,
} from "./sphere.js";

import {
    cancelPlane,
    changePlaneDistance,
    changePlaneHeight,
    changePlaneWidth,
    openPlane,
    savePlaneToInspectMode,
} from "./plane.js";

import {
    cancelCylinder,
    applyCylindricalRadius,
    openCylindricalImages,
    applyCylindricalHeight,
    saveCylinderToInspectMode,
} from "./cylinder.js";

import { setFiguresVisibility } from "./inspect.js";

const panel = new GUI({ width: 290 });

const mode_folder = panel.addFolder("Mode");
const folder1 = panel.addFolder("Image Settings");
const folder2 = panel.addFolder("Individual Selection");
const folder3 = panel.addFolder("Sphere");
const folder4 = panel.addFolder("Plane");
const folder5 = panel.addFolder("Cylinder");

const infoElement = document.getElementById("info");

function createPanel() {
    let mode_settings = {
        "Change to Authoring mode": function () {
            hideController("Mode", "Change to Authoring mode");
            showController("Mode", "Change to Inspect mode");
            hideFolder("Individual Selection");
            showFolder("Image Settings");
            showFolder("Sphere");
            showFolder("Plane");
            showFolder("Cylinder");

            resetMessage();
            setSelectionMode("multi");

            setImageVisibility(true);
            setFiguresVisibility(false);
            setAuthoringMode(true);
        },
        "Change to Inspect mode": function () {
            showController("Mode", "Change to Authoring mode");
            hideController("Mode", "Change to Inspect mode");
            hideFolder("Individual Selection");
            hideFolder("Image Settings");
            hideFolder("Sphere");
            hideFolder("Plane");
            hideFolder("Cylinder");

            setMessage("Open predefined figures");
            setSelectionMode("multi");

            cancelSphere();
            cancelPlane();
            cancelCylinder();
            clearSelection();
            setImageVisibility(false);
            setFiguresVisibility(true);
            setAuthoringMode(false);
        },
    };
    let settings1 = {
        "Image size": 1.0,
        "Camera image separation": 0.2,
        "Image wireframe": true,
    };

    let settings2 = {
        "Clear Selection": function () {
            clearSelection();

            hideFolder("Individual Selection");
            showFolder("Sphere");
            showFolder("Plane");
            showFolder("Cylinder");
            resetMessage();
        },
        "Open in 2D viewer": function () {
            openImagesToOpenSeaDragon();

            hideFolder("Individual Selection");
            showFolder("Sphere");
            showFolder("Plane");
            showFolder("Cylinder");
            resetMessage();
        },
    };

    let settings3 = {
        "Create Sphere": function () {
            showController("Sphere", "Cancel");
            hideController("Sphere", "Create Sphere");
            hideController("Sphere", "Radius");
            hideController("Sphere", "Open in 2D viewer");
            hideController("Sphere", "Save figure to Inspect mode");

            hideFolder("Individual Selection");
            hideFolder("Plane");
            hideFolder("Cylinder");

            setMessage("Select 1 image");
            setSelectionMode("sphere");
        },
        "Open in 2D viewer": function () {
            openSphericalImages();
        },
        Radius: 0.5,
        "Save figure to Inspect mode": function () {
            saveSphereToInspectMode();
        },
        Cancel: function () {
            cancelSphere();

            hideController("Sphere", "Cancel");
            showController("Sphere", "Create Sphere");
            hideController("Sphere", "Radius");
            hideController("Sphere", "Open in 2D viewer");
            hideController("Sphere", "Save figure to Inspect mode");

            showFolder("Plane");
            showFolder("Cylinder");
            hideFolder("Individual Selection");

            resetMessage();
            setSelectionMode("multi");
        },
    };

    let settings4 = {
        "Create Plane": function () {
            hideController("Plane", "Width");
            hideController("Plane", "Height");
            hideController("Plane", "Max distance");
            hideController("Plane", "Open in 2D viewer");
            showController("Plane", "Cancel");
            hideController("Plane", "Create Plane");
            hideController("Plane", "Save figure to Inspect mode");

            hideFolder("Individual Selection");
            hideFolder("Sphere");
            hideFolder("Cylinder");

            setMessage("Select 3 images");
            setSelectionMode("plane");
        },
        "Save figure to Inspect mode": function () {
            savePlaneToInspectMode();
        },
        Cancel: function () {
            cancelPlane();
            hideController("Plane", "Width");
            hideController("Plane", "Height");
            hideController("Plane", "Max distance");
            hideController("Plane", "Open in 2D viewer");
            hideController("Plane", "Cancel");
            showController("Plane", "Create Plane");
            hideController("Plane", "Save figure to Inspect mode");

            showFolder("Sphere");
            showFolder("Cylinder");
            hideFolder("Individual Selection");

            resetMessage();
            setSelectionMode("multi");
        },
        Width: 1,
        Height: 1,
        "Max distance": 0.1,
        "Open in 2D viewer": function () {
            openPlane();
        },
    };

    let settings5 = {
        "Create Cylinder": function () {
            hideController("Cylinder", "Radius");
            hideController("Cylinder", "Height");
            hideController("Cylinder", "Open in 2D viewer");
            showController("Cylinder", "Cancel");
            hideController("Cylinder", "Create Cylinder");
            hideController("Cylinder", "Save figure to Inspect mode");

            hideFolder("Individual Selection");
            hideFolder("Sphere");
            hideFolder("Plane");

            setMessage("Select 2 images");
            setSelectionMode("cylinder");
        },
        "Open in 2D viewer": function () {
            openCylindricalImages();
        },
        Radius: 0.5,
        Height: 1.0,
        "Save figure to Inspect mode": function () {
            saveCylinderToInspectMode();
        },
        Cancel: function () {
            cancelCylinder();

            hideController("Cylinder", "Radius");
            hideController("Cylinder", "Height");
            hideController("Cylinder", "Open in 2D viewer");
            hideController("Cylinder", "Cancel");
            showController("Cylinder", "Create Cylinder");
            hideController("Cylinder", "Save figure to Inspect mode");

            showFolder("Sphere");
            showFolder("Plane");
            hideFolder("Individual Selection");

            resetMessage();
            setSelectionMode("multi");
        },
    };

    mode_folder.add(mode_settings, "Change to Inspect mode");
    mode_folder.add(mode_settings, "Change to Authoring mode");

    folder1.add(settings1, "Image size", 0.0, 5.0, 0.01).onChange(setSize);
    folder1.add(settings1, "Camera image separation", 0.01, 2.0, 0.01).onChange(setOffset);
    folder1.add(settings1, "Image wireframe").onChange(setWireframe);

    folder2.add(settings2, "Open in 2D viewer");
    folder2.add(settings2, "Clear Selection");

    folder3.add(settings3, "Create Sphere");
    folder3.add(settings3, "Radius", 0.0, 5.0, 0.01).onChange(applySphericalRadius);
    folder3.add(settings3, "Open in 2D viewer");
    folder3.add(settings3, "Save figure to Inspect mode");
    folder3.add(settings3, "Cancel");

    folder4.add(settings4, "Create Plane");
    folder4.add(settings4, "Width", 0.0, 10.0, 0.01).onChange(changePlaneWidth);
    folder4.add(settings4, "Height", 0.0, 10.0, 0.01).onChange(changePlaneHeight);
    folder4.add(settings4, "Max distance", 0.0, 5.0, 0.01).onChange(changePlaneDistance);
    folder4.add(settings4, "Open in 2D viewer");
    folder4.add(settings4, "Save figure to Inspect mode");
    folder4.add(settings4, "Cancel");

    folder5.add(settings5, "Create Cylinder");
    folder5.add(settings5, "Radius", 0.0, 5.0, 0.01).onChange(applyCylindricalRadius);
    folder5.add(settings5, "Height", 0.0, 5.0, 0.01).onChange(applyCylindricalHeight);
    folder5.add(settings5, "Open in 2D viewer");
    folder5.add(settings5, "Save figure to Inspect mode");
    folder5.add(settings5, "Cancel");

    // Initialize panel
    hideFolder("Individual Selection");
    //hideFolder("Sphere");
    //hideFolder("Plane");
    //hideFolder("Cylinder");
    hideController("Mode", "Change to Authoring mode");
    hideController("Sphere", "Radius");
    hideController("Sphere", "Open in 2D viewer");
    hideController("Sphere", "Save figure to Inspect mode");
    hideController("Sphere", "Cancel");
    hideController("Plane", "Width");
    hideController("Plane", "Height");
    hideController("Plane", "Max distance");
    hideController("Plane", "Open in 2D viewer");
    hideController("Plane", "Save figure to Inspect mode");
    hideController("Plane", "Cancel");
    hideController("Cylinder", "Radius");
    hideController("Cylinder", "Height");
    hideController("Cylinder", "Open in 2D viewer");
    hideController("Cylinder", "Save figure to Inspect mode");
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

function setMessage(message) {
    infoElement.innerText = message;
}

function resetMessage() {
    infoElement.innerText =
        "Open an image with left click, select images with right click or create a figure";
}

function setSphereSettings() {
    showController("Sphere", "Cancel");
    hideController("Sphere", "Create Sphere");
    showController("Sphere", "Radius");
    showController("Sphere", "Open in 2D viewer");
    showController("Sphere", "Save figure to Inspect mode");

    setMessage("");
}

function setCylinderSettings() {
    showController("Cylinder", "Radius");
    showController("Cylinder", "Height");
    showController("Cylinder", "Open in 2D viewer");
    showController("Cylinder", "Cancel");
    hideController("Cylinder", "Create Cylinder");
    showController("Cylinder", "Save figure to Inspect mode");

    setMessage("");
}

function setPlaneSettings() {
    showController("Plane", "Width");
    showController("Plane", "Height");
    showController("Plane", "Max distance");
    showController("Plane", "Open in 2D viewer");
    showController("Plane", "Cancel");
    hideController("Plane", "Create Plane");
    showController("Plane", "Save figure to Inspect mode");

    setMessage("");
}

function setMultiSettings() {
    showFolder("Individual Selection");
    hideFolder("Sphere");
    hideFolder("Plane");
    hideFolder("Cylinder");

    setMessage("");
}

function resetUI() {
    hideFolder("Individual Selection");
    showFolder("Sphere");
    showFolder("Plane");
    showFolder("Cylinder");

    resetMessage();
}

export {
    createPanel,
    setSliderValue,
    setSphereSettings,
    setCylinderSettings,
    setPlaneSettings,
    setMultiSettings,
    resetUI,
};
