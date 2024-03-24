import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { setSize, setOffset } from './single-image-loader.js';

function createPanel() {

    const panel = new GUI( { width: 310 } );

    const folder1 = panel.addFolder( 'Image Settings' );

    let settings = {
        'Modify image size': 1.0,
        'Modify image separation': 0.0
    };


    folder1.add( settings, 'Modify image size', 0.0, 5.0, 0.01 ).onChange( setSize );
    folder1.add( settings, 'Modify image separation', 0.0, 2.0, 0.01 ).onChange(  setOffset );

    folder1.open();

}


export {createPanel}