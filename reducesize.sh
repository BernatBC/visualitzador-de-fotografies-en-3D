#!/bin/bash
for f in `find . -name "*.jpg"`
do
    convert $f -resize 10% $f
done
