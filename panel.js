import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { setSize, setOffset } from './single-image-loader.js';
import { openImagesToOpenSeaDragon, clearSelection } from './interaction.js';

function createPanel() {

    const panel = new GUI( { width: 310 } );

    const folder1 = panel.addFolder( 'Image Settings' );
    const folder2 = panel.addFolder( 'OpenSeaDragon' );

    let settings = {
        'Modify image size': 1.0,
        'Modify image separation': 0.2,
        'Open Selected images to OpenSeaDragon': function () {openImagesToOpenSeaDragon()},
        'Clear Images Selected': function () {clearSelection()}
    };


    folder1.add( settings, 'Modify image size', 0.0, 5.0, 0.01 ).onChange( setSize );
    folder1.add( settings, 'Modify image separation', 0, 2.0, 0.01 ).onChange(  setOffset );
    folder1.open();

    folder2.add(settings, 'Open Selected images to OpenSeaDragon');
    folder2.add(settings, 'Clear Images Selected');
    folder2.open();


}


export {createPanel}