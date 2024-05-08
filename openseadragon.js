const urlParams = new URLSearchParams(window.location.search);
const image = urlParams.get("image");
const mode = urlParams.get("mode");

console.log(mode);
console.log(image);

var sources = [];

if (mode === "single") {
    var imageName = image.substr(0, image.lastIndexOf(".")) + ".dzi";
    sources.push("images/" + imageName);
} else {
    var retrievedObject = localStorage.getItem("images");
    const parsedImages = JSON.parse(retrievedObject);
    console.log(parsedImages);
    parsedImages.forEach((image) => {
        var imageName = image.name.substr(0, image.name.lastIndexOf(".")) + ".dzi";
        console.log(
            imageName +
                " - " +
                "X: " +
                image.x.toString() +
                ", Y: " +
                image.y.toString() +
                ", Height: " +
                image.height.toString() +
                ", Zoom: " +
                image.zoom.toString()
        );
        sources.push({
            tileSource: "images/" + imageName,
            x: image.x,
            y: image.y,
            height: (2 * image.height) / image.zoom,
        });
    });
}

var viewer = OpenSeadragon({
    id: "openseadragon1",
    prefixUrl: "openseadragon/images/",
    tileSources: sources,

    showNavigator: true,
    preserveViewport: true,
});
