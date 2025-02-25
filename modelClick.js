import { getAllImages, createJSON } from "./interaction";

const MAX_DISTANCE = 0.1;

function openNearbyImages(object) {
    const images = getAllImages();
    let nearbyImages = [];
    images.forEach((i) => {
        if (isImageNearby(object.point, i.userData.intersectionPointsMatrix)) {
            console.log("NearbyImage: ", i.name);
            nearbyImages.push(i);
        }
    });
    if (nearbyImages.length == 0) {
        console.log("No nearby images found");
        return;
    }
    openImagesToOpenSeaDragon(nearbyImages);
}

function isImageNearby(pointPressed, pointMatrix) {
    for (let i = 0; i < pointMatrix.length; i++)
        for (let j = 0; j < pointMatrix[0].length; j++)
            if (pointPressed.distanceTo(pointMatrix[i][j]) < MAX_DISTANCE) return true;
    return false;
}

function openImagesToOpenSeaDragon(imagesSelected) {
    let jsonContent = JSON.stringify(createJSON(imagesSelected));
    localStorage.setItem("images", jsonContent);
    const url = "openseadragon.html?mode=multiple";
    window.open(url, "blank");
}

export { openNearbyImages };
