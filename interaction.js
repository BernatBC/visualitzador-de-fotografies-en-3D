import * as THREE from 'three'
import {render} from './main.js'

var mouse = new THREE.Vector2()
var raycaster = new THREE.Raycaster();
var hover = undefined
var mDragging = false;
var mDown = false;
var camera
var scene

function addInteraction(cam, sce) {
    camera = cam
    scene = sce

    // OBRIR IMATGES EN OPENSEADRAGON
    window.addEventListener('mousedown', function () {
        mDown = true;
    });

    window.addEventListener('mousemove', function () {
        if(mDown) mDragging = true;
    });

    window.addEventListener('mouseup', function() {
        if(mDragging === false) onClick(camera)
        mDown = false;
        mDragging = false;
    });

    window.addEventListener('pointermove', onHover);
}

function onClick() {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
        var object = intersects[0].object;
        if (object.name.startsWith('Sant Quirze de Pedret by Zones')) {
            const url = 'openseadragon.html?image=' + encodeURIComponent(object.name);
            window.open(url, '_blank')
        }
    }
      render();
}

function hoverIn(image_object) {
    image_object.material.color.setHex( 0xccffff )
    hover = image_object
}

function hoverOut() {
    hover.material.color.setHex( 0xffffff )
    hover = undefined
}

function onHover() {
    if (mDragging) return
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
        var object = intersects[0].object;
        if (object.name.startsWith('Sant Quirze de Pedret by Zones')) {
            // New Hover
            if (hover === undefined) hoverIn(object)
            // Replace hover
            else if (hover.name !== object.name) {
                hoverOut()
                hoverIn(object)
            }
        }
        // Hovering a non-image object
        else if (hover !== undefined) hoverOut();
    }
    //No hovering any image
    else if (hover !== undefined) hoverOut();

    render();
}

export {addInteraction}