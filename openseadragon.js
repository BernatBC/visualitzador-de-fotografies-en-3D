const urlParams = new URLSearchParams(window.location.search);
const image = urlParams.get("image");
const mode = urlParams.get("mode");

const retrievedObject = localStorage.getItem("images");
const parsedImages = JSON.parse(retrievedObject);

console.log(mode);
console.log(image);

var sources = [];

if (mode === "single") {
    var imageName = image.substr(0, image.lastIndexOf(".")) + ".dzi";
    sources.push("images/" + imageName);
} else {
    console.log(parsedImages);
    parsedImages.forEach((image) => {
        var imageName = image.name.substr(0, image.name.lastIndexOf(".")) + ".dzi";
        sources.push({
            tileSource: "images/" + imageName,
            x: image.x,
            y: image.y,
            height: getRealHeight(image),
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

viewer.addHandler("open", function () {
    distribute(parsedImages);
});

var overlapping = true;

function distribute(images) {
    console.log("--------");
    while (overlapping) {
        overlapping = false;
        for (let i = 0; i < images.length; i++) align(images[i], images, i);
    }
}

function align(a, images, i) {
    console.log("ALIGNING: " + a.name);
    var output = { x: 0, y: 0 };
    images.forEach((b) => {
        if (a.name === b.name) return;
        var intersection = getIntersection(a, b);
        if (!intersection) return;
        console.log("OVERLAPPING: " + a.name + ", " + b.name);
        overlapping = true;
        //console.log(a);
        //console.log(b);
        //console.log(intersection);
        var dist = getDistance(a, b);
        //console.log("Distance: " + dist.x + ", " + dist.y);
        if (a.width < b.width / 2) {
            if (abs(dist.x) > abs(dist.y)) {
                output.x += sign(dist.x) * intersection.width;
            } else {
                output.y += sign(dist.y) * intersection.height;
            }
        } else {
            if (intersection.width < intersection.height) {
                output.x += sign(dist.x) * intersection.width;
            } else {
                output.y += sign(dist.y) * intersection.height;
            }
        }
    });
    console.log("output: " + output.x + ", " + output.y);
    if (output.x != 0 || output.y != 0) moveImage(a, output, i);
    console.log("---");
}

function getIntersection(a, b) {
    var left = max(getLeft(a), getLeft(b));
    var top = min(getTop(a), getTop(b));
    var right = min(getRight(a), getRight(b));
    var bottom = max(getBottom(a), getBottom(b));

    if (bottom < top && right > left) {
        return {
            top: top,
            bottom: bottom,
            left: left,
            right: right,
            height: top - bottom,
            width: right - left,
        };
    }

    return null;
}

function moveImage(a, output, i) {
    a.x += output.x;
    a.y += output.y;
    console.log("NEW POSITION");
    console.log(a.name + ": " + a.x + ", " + a.y);
    var item = viewer.world.getItemAt(i);
    item.setPosition(new OpenSeadragon.Point(a.x, a.y));
}

function max(a, b) {
    if (a > b) return a;
    return b;
}

function min(a, b) {
    if (a < b) return a;
    return b;
}

function getLeft(a) {
    return a.x - getRealWidth(a) / 2;
}

function getRight(a) {
    return a.x + getRealWidth(a) / 2;
}

function getTop(a) {
    return a.y + getRealHeight(a) / 2;
}

function getBottom(a) {
    return a.y - getRealHeight(a) / 2;
}

function getDistance(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}

function getRealHeight(a) {
    return (2 * a.height) / a.zoom;
}

function getRealWidth(a) {
    return (2 * a.width) / a.zoom;
}

function abs(a) {
    if (a < 0) return -a;
    return a;
}

function sign(a) {
    if (a < 0) return -1;
    return 1;
}
