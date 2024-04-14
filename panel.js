import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { setSize, setOffset } from "./single-image-loader.js";
import {
    openImagesToOpenSeaDragon,
    clearSelection,
    applySphericalRadius,
    openSphericalImages,
    cancelSphere,
    createSphere,
} from "./interaction.js";

import {
    createPlane,
    cancelPlane,
    changePlaneDistance,
    openPlane,
} from "./plane.js";

function createPanel() {
    const panel = new GUI({ width: 290 });

    const folder1 = panel.addFolder("Image Settings");
    const folder2 = panel.addFolder("Individual Selection");
    const folder3 = panel.addFolder("Sphere");
    const folder4 = panel.addFolder("Plane");

    let settings1 = {
        "Image size": 1.0,
        "Image separation": 0.2,
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
        Radius: 2.0,
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
        "Max distance": 0.2,
        "Open to OpenSeaDragon": function () {
            openPlane();
        },
    };

    folder1.add(settings1, "Image size", 0.0, 5.0, 0.01).onChange(setSize);
    folder1
        .add(settings1, "Image separation", 0, 2.0, 0.01)
        .onChange(setOffset);
    folder1.open();

    folder2.add(settings2, "Open to OpenSeaDragon");
    folder2.add(settings2, "Clear Selection");
    folder2.open();

    folder3.add(settings3, "Create Sphere");
    folder3
        .add(settings3, "Radius", 0.0, 10.0, 0.01)
        .onChange(applySphericalRadius);
    folder3.add(settings3, "Open to OpenSeaDragon");
    folder3.add(settings3, "Cancel");

    folder4.add(settings4, "Create Plane");
    folder4
        .add(settings4, "Max distance", 0.0, 5.0, 0.01)
        .onChange(changePlaneDistance);
    folder4.add(settings4, "Open to OpenSeaDragon");
    folder4.add(settings4, "Cancel");
}

export { createPanel };
