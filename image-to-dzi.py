
import os
import sys
import deepzoom

image_name = sys.argv[1]
output = os.path.splitext(image_name)[0]+'.dzi'

# Specify your source image


# Create Deep Zoom Image creator with weird parameters
creator = deepzoom.ImageCreator(
    tile_size=128,
    tile_overlap=2,
    tile_format="png",
    image_quality=0.8,
    resize_filter="bicubic",
)

# Create Deep Zoom image pyramid from source
creator.create(image_name, output)