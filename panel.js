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

const panel = new GUI({ width: 290, title: "Show/Hide Interface" });

const mode_folder = panel.addFolder("Mode");
const folder2 = panel.addFolder("Individual Selection");
const folder4 = panel.addFolder("Plane");
const folder3 = panel.addFolder("Sphere");
const folder5 = panel.addFolder("Cylinder");
const folder1 = panel.addFolder("Image Settings");

const infoElement = document.getElementById("info");

function createPanel() {
    let mode_settings = {
        "Enter Author Mode (expert)": function () {
            hideController("Mode", "Enter Author Mode (expert)");
            showController("Mode", "Enter Inspect Mode (easy)");
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
        "Enter Inspect Mode (easy)": function () {
            showController("Mode", "Enter Author Mode (expert)");
            hideController("Mode", "Enter Inspect Mode (easy)");
            hideFolder("Individual Selection");
            hideFolder("Image Settings");
            hideFolder("Sphere");
            hideFolder("Plane");
            hideFolder("Cylinder");

            setMessage("Click any colored shape to open its related images");
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
        "Thumbnail size": 1.0,
        "Frustum length": 0.1,
        "Show frustum": true,
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
        "New Sphere...": function () {
            showController("Sphere", "Done");
            hideController("Sphere", "New Sphere...");
            hideController("Sphere", "Radius");
            hideController("Sphere", "Open in 2D viewer");
            hideController("Sphere", "Save selection (for Inspect Mode)");

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
        "Save selection (for Inspect Mode)": function () {
            saveSphereToInspectMode();
            this.Done();
        },
        Done: function () {
            cancelSphere();

            hideController("Sphere", "Done");
            showController("Sphere", "New Sphere...");
            hideController("Sphere", "Radius");
            hideController("Sphere", "Open in 2D viewer");
            hideController("Sphere", "Save selection (for Inspect Mode)");

            showFolder("Plane");
            showFolder("Cylinder");
            hideFolder("Individual Selection");

            resetMessage();
            setSelectionMode("multi");
        },
    };

    let settings4 = {
        "New Plane...": function () {
            hideController("Plane", "Width");
            hideController("Plane", "Height");
            hideController("Plane", "Depth");
            hideController("Plane", "Open in 2D viewer");
            showController("Plane", "Done");
            hideController("Plane", "New Plane...");
            hideController("Plane", "Save selection (for Inspect Mode)");

            hideFolder("Individual Selection");
            hideFolder("Sphere");
            hideFolder("Cylinder");

            setMessage("Select 3 images");
            setSelectionMode("plane");
        },
        "Save selection (for Inspect Mode)": function () {
            savePlaneToInspectMode();
            this.Done();
        },
        Done: function () {
            cancelPlane();
            hideController("Plane", "Width");
            hideController("Plane", "Height");
            hideController("Plane", "Depth");
            hideController("Plane", "Open in 2D viewer");
            hideController("Plane", "Done");
            showController("Plane", "New Plane...");
            hideController("Plane", "Save selection (for Inspect Mode)");

            showFolder("Sphere");
            showFolder("Cylinder");
            hideFolder("Individual Selection");

            resetMessage();
            setSelectionMode("multi");
        },
        Width: 1,
        Height: 1,
        "Depth": 0.1,
        "Open in 2D viewer": function () {
            openPlane();
        },
    };

    let settings5 = {
        "New Cylinder...": function () {
            hideController("Cylinder", "Radius");
            hideController("Cylinder", "Height");
            hideController("Cylinder", "Open in 2D viewer");
            showController("Cylinder", "Done");
            hideController("Cylinder", "New Cylinder...");
            hideController("Cylinder", "Save selection (for Inspect Mode)");

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
        "Save selection (for Inspect Mode)": function () {
            saveCylinderToInspectMode();
            this.Done();
        },
        Done: function () {
            cancelCylinder();

            hideController("Cylinder", "Radius");
            hideController("Cylinder", "Height");
            hideController("Cylinder", "Open in 2D viewer");
            hideController("Cylinder", "Done");
            showController("Cylinder", "New Cylinder...");
            hideController("Cylinder", "Save selection (for Inspect Mode)");

            showFolder("Sphere");
            showFolder("Plane");
            hideFolder("Individual Selection");

            resetMessage();
            setSelectionMode("multi");
        },
    };

    mode_folder.add(mode_settings, "Enter Inspect Mode (easy)");
    mode_folder.add(mode_settings, "Enter Author Mode (expert)");

    folder1.add(settings1, "Thumbnail size", 0.0, 2.0, 0.01).onChange(setSize);
    folder1.add(settings1, "Frustum length", 0.01, 0.5, 0.01).onChange(setOffset);
    folder1.add(settings1, "Show frustum").onChange(setWireframe);

    folder2.add(settings2, "Open in 2D viewer");
    folder2.add(settings2, "Clear Selection");

    folder3.add(settings3, "New Sphere...");
    folder3.add(settings3, "Radius", 0.0, 5.0, 0.01).onChange(applySphericalRadius);
    folder3.add(settings3, "Open in 2D viewer");
    folder3.add(settings3, "Save selection (for Inspect Mode)");
    folder3.add(settings3, "Done");

    folder4.add(settings4, "New Plane...");
    folder4.add(settings4, "Width", 0.0, 10.0, 0.01).onChange(changePlaneWidth);
    folder4.add(settings4, "Height", 0.0, 10.0, 0.01).onChange(changePlaneHeight);
    folder4.add(settings4, "Depth", 0.0, 5.0, 0.01).onChange(changePlaneDistance);
    folder4.add(settings4, "Open in 2D viewer");
    folder4.add(settings4, "Save selection (for Inspect Mode)");
    folder4.add(settings4, "Done");

    folder5.add(settings5, "New Cylinder...");
    folder5.add(settings5, "Radius", 0.0, 5.0, 0.01).onChange(applyCylindricalRadius);
    folder5.add(settings5, "Height", 0.0, 5.0, 0.01).onChange(applyCylindricalHeight);
    folder5.add(settings5, "Open in 2D viewer");
    folder5.add(settings5, "Save selection (for Inspect Mode)");
    folder5.add(settings5, "Done");

    // Initialize panel
    hideFolder("Individual Selection");
    hideController("Mode", "Enter Author Mode (expert)");
    hideController("Sphere", "Radius");
    hideController("Sphere", "Open in 2D viewer");
    hideController("Sphere", "Save selection (for Inspect Mode)");
    hideController("Sphere", "Done");
    hideController("Plane", "Width");
    hideController("Plane", "Height");
    hideController("Plane", "Depth");
    hideController("Plane", "Open in 2D viewer");
    hideController("Plane", "Save selection (for Inspect Mode)");
    hideController("Plane", "Done");
    hideController("Cylinder", "Radius");
    hideController("Cylinder", "Height");
    hideController("Cylinder", "Open in 2D viewer");
    hideController("Cylinder", "Save selection (for Inspect Mode)");
    hideController("Cylinder", "Done");
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
        "Left click on an image: Open the image    |    Right click on an image: Select the image";
}

function setSphereSettings() {
    showController("Sphere", "Done");
    hideController("Sphere", "New Sphere...");
    showController("Sphere", "Radius");
    showController("Sphere", "Open in 2D viewer");
    showController("Sphere", "Save selection (for Inspect Mode)");

    setMessage("");
}

function setCylinderSettings() {
    showController("Cylinder", "Radius");
    showController("Cylinder", "Height");
    showController("Cylinder", "Open in 2D viewer");
    showController("Cylinder", "Done");
    hideController("Cylinder", "New Cylinder...");
    showController("Cylinder", "Save selection (for Inspect Mode)");

    setMessage("");
}

function setPlaneSettings() {
    showController("Plane", "Width");
    showController("Plane", "Height");
    showController("Plane", "Depth");
    showController("Plane", "Open in 2D viewer");
    showController("Plane", "Done");
    hideController("Plane", "New Plane...");
    showController("Plane", "Save selection (for Inspect Mode)");

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
