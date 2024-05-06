#!/bin/bash
for f in `find . -name "*.JPG"`
do
    python3 image-to-dzi.py $f
    echo $f
done
for f in `find . -name "*.jpg"`
do
    python3 ./image-to-dzi.py $f
    echo $f
done
