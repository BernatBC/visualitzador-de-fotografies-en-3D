const urlParams = new URLSearchParams(window.location.search);
const images = urlParams.get("images");
const parsedImages = JSON.parse(images);

var sources = [];
var overlays = [];
var i = 0;

console.log(parsedImages);

if (!Array.isArray(parsedImages)) {
    sources.push({
        type: "image",
        url: "images/" + parsedImages,
        buildPyramid: false,
    });
}

var viewer = OpenSeadragon({
    id: "openseadragon1",
    prefixUrl: "openseadragon/images/",
    tileSources: sources,

    showNavigator: true,
    preserveViewport: true,
});

if (Array.isArray(parsedImages)) {
    parsedImages.forEach((image) => {
        console.log(
            "Phi: " +
                image.phi.toString() +
                ", Theta: " +
                image.theta.toString() +
                ", Height: " +
                image.height.toString()
        );
        viewer.addTiledImage({
            tileSource: {
                type: "image",
                url: "images/" + image.name,
                buildPyramid: false,
            },
            x: image.phi,
            y: image.theta,
            height: image.height,
        });
    });
}
