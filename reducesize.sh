#!/bin/bash
for f in `find . -name "*.jpg"`
do
    convert $f -resize 10% $f
done
for f in `find . -name "*.JPG"`
do
    convert $f -resize 10% $f
done
