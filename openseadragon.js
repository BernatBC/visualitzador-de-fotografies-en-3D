const urlParams = new URLSearchParams(window.location.search);
const image = urlParams.get("image");
const mode = urlParams.get("mode");

console.log(mode);
console.log(image);

var sources = [];

if (mode === "single") {
    sources.push({
        type: "image",
        url: "images/" + image,
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

if (mode !== "single") {
    var retrievedObject = localStorage.getItem("images");
    const parsedImages = JSON.parse(retrievedObject);
    console.log(parsedImages);
    parsedImages.forEach((image) => {
        console.log(
            "X: " +
                image.x.toString() +
                ", Y: " +
                image.y.toString() +
                ", Height: " +
                image.height.toString()
        );
        viewer.addTiledImage({
            tileSource: {
                type: "image",
                url: "images/" + image.name,
                buildPyramid: false,
            },
            x: image.x,
            y: image.y,
            height: image.height,
        });
    });
}
