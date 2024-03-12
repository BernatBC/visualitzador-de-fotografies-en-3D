import * as THREE from 'three'

import {loadImage} from './single-image-loader.js'
import { create, all } from 'mathjs'

const math = create(all,  {})

//Read Images file
function read_image_list(filePath) {
    return new Promise((resolve) => {
        const loader = new THREE.FileLoader();
        loader.load(filePath, (data) => {
            resolve(data.split('\n'));
        });
    });
}

async function loadImages(scene, images_file, cameras_file) {

    const image_list = await read_image_list(images_file)

    //CAMERAS LOADER
    const image_loader = new THREE.TextureLoader();
    const out_file_loader = new THREE.FileLoader();
    out_file_loader.load( cameras_file,
	    function ( data ) {
            const lines = data.split('\n');
            const num_cameras = lines[1].split(' ')[0]

            for (let i = 0; i < num_cameras; i++) {
                const line_number = 2 + 5*i;

                //Descarta les imatges lsp
                if (image_list[i].endsWith('.lsp')) continue

                const R = math.matrix([lines[line_number + 1].split(' ').map(parseFloat), lines[line_number + 2].split(' ').map(parseFloat), lines[line_number + 3].split(' ').map(parseFloat)]);
                const t = math.matrix(lines[line_number + 4].split(' ').map(parseFloat));

            loadImage(scene, R, t, image_list[i], image_loader)
            }
	    }
    );
}

export {loadImages}