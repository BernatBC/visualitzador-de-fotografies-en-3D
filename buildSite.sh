#!/bin/bash
npx vite build
echo "Copying openseadragon.html into dist/"
cp openseadragon.html dist/
echo "Copying openseadragon.css into dist/"
cp openseadragon.css dist/
echo "Copying openseadragon.js into dist/"
cp openseadragon.js dist/
echo "Copying openseadragon/ into dist/"
cp -r openseadragon dist/
