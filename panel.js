import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { setSize, setOffset } from "./single-image-loader.js";
import {
    openImagesToOpenSeaDragon,
    clearSelection,
    applySphericalRadius,
    openSphericalImages,
    openPlaneImages,
    cancelPlane,
} from "./interaction.js";

function createPanel() {
    const panel = new GUI({ width: 290 });

    const folder1 = panel.addFolder("Image Settings");
    const folder2 = panel.addFolder("Multiple Picked OpenSeaDragon");
    const folder3 = panel.addFolder("Spherical OpenSeaDragon");
    const folder4 = panel.addFolder("Plane");

    let settings = {
        "Modify image size": 1.0,
        "Modify image separation": 0.2,
        "Open Selected images to OpenSeaDragon": function () {
            openImagesToOpenSeaDragon();
        },
        "Clear Images Selected": function () {
            clearSelection();
        },
        "Open images to OpenSeaDragon": function () {
            openSphericalImages();
        },
        "Create plane": function () {
            openPlaneImages();
        },
        Cancel: function () {
            cancelPlane();
        },
        "Open images to OpenSeaDragon": function () {
            openSphericalImages();
        },
        "Modify Spherical Radius": 2.0,
    };

    folder1
        .add(settings, "Modify image size", 0.0, 5.0, 0.01)
        .onChange(setSize);
    folder1
        .add(settings, "Modify image separation", 0, 2.0, 0.01)
        .onChange(setOffset);
    folder1.open();

    folder2.add(settings, "Open Selected images to OpenSeaDragon");
    folder2.add(settings, "Clear Images Selected");
    folder2.open();

    folder3
        .add(settings, "Modify Spherical Radius", 0.0, 10.0, 0.01)
        .onChange(applySphericalRadius);
    folder3.add(settings, "Open images to OpenSeaDragon");

    folder4.add(settings, "Create plane");
    folder4.add(settings, "Cancel");
}

export { createPanel };
