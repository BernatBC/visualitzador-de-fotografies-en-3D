import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { setSize, setOffset, setWireframe } from "./single-image-loader.js";
import { openImagesToOpenSeaDragon, clearSelection } from "./interaction.js";

import {
    applySphericalRadius,
    openSphericalImages,
    cancelSphere,
    createSphere,
} from "./sphere.js";

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

function createPanel() {
    const panel = new GUI({ width: 290 });

    const folder1 = panel.addFolder("Image Settings");
    const folder2 = panel.addFolder("Individual Selection");
    const folder3 = panel.addFolder("Sphere");
    const folder4 = panel.addFolder("Plane");
    const folder5 = panel.addFolder("Cylinder");

    let settings1 = {
        "Image size": 1.0,
        "Image separation": 0.2,
        "Image wireframe": true,
    };

    let settings2 = {
        "Clear Selection": function () {
            clearSelection();
        },
        "Open to OpenSeaDragon": function () {
            openImagesToOpenSeaDragon();
        },
    };

    let settings3 = {
        "Create Sphere": function () {
            createSphere();
        },
        "Open to OpenSeaDragon": function () {
            openSphericalImages();
        },
        Radius: 0.5,
        Cancel: function () {
            cancelSphere();
        },
    };

    let settings4 = {
        "Create Plane": function () {
            createPlane();
        },
        Cancel: function () {
            cancelPlane();
        },
        Width: 1,
        Height: 1,
        "Max distance": 0.2,
        "Open to OpenSeaDragon": function () {
            openPlane();
        },
    };

    let settings5 = {
        "Create Cylinder": function () {
            createCylinder();
        },
        "Open to OpenSeaDragon": function () {
            openCylindricalImages();
        },
        Radius: 0.5,
        Height: 1.0,
        Cancel: function () {
            cancelCylinder();
        },
    };

    folder1.add(settings1, "Image size", 0.0, 5.0, 0.01).onChange(setSize);
    folder1
        .add(settings1, "Image separation", 0, 2.0, 0.01)
        .onChange(setOffset);
    folder1.add(settings1, "Image wireframe").onChange(setWireframe);

    folder2.add(settings2, "Open to OpenSeaDragon");
    folder2.add(settings2, "Clear Selection");

    folder3.add(settings3, "Create Sphere");
    folder3
        .add(settings3, "Radius", 0.0, 5.0, 0.01)
        .onChange(applySphericalRadius);
    folder3.add(settings3, "Open to OpenSeaDragon");
    folder3.add(settings3, "Cancel");

    folder4.add(settings4, "Create Plane");
    folder4.add(settings4, "Width", 0.0, 5.0, 0.01).onChange(changePlaneWidth);
    folder4
        .add(settings4, "Height", 0.0, 5.0, 0.01)
        .onChange(changePlaneHeight);
    folder4
        .add(settings4, "Max distance", 0.0, 5.0, 0.01)
        .onChange(changePlaneDistance);
    folder4.add(settings4, "Open to OpenSeaDragon");
    folder4.add(settings4, "Cancel");

    folder5.add(settings5, "Create Cylinder");
    folder5
        .add(settings5, "Radius", 0.0, 5.0, 0.01)
        .onChange(applyCylindricalRadius);
    folder5
        .add(settings5, "Height", 0.0, 5.0, 0.01)
        .onChange(applyCylindricalHeight);
    folder5.add(settings5, "Open to OpenSeaDragon");
    folder5.add(settings5, "Cancel");
}

export { createPanel };
