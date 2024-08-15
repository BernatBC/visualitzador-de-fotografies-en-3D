import { getAllImages } from "./interaction";

const MAX_DISTANCE = 0.1;

function openNearbyImages(object) {
    const images = getAllImages();
    images.forEach((i) => {
        if (isImageNearby(object.point, i.userData.intersectionPointsMatrix))
            console.log("NearbyImage: ", i.name);
    });
    console.log(object.point);
}

function isImageNearby(pointPressed, pointMatrix) {
    for (let i = 0; i < 11; i++)
        for (let j = 0; j < 11; j++)
            if (pointPressed.distanceTo(pointMatrix[i][j]) < MAX_DISTANCE) return true;
    return false;
}

export { openNearbyImages };
