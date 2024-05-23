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
        image.x = parseFloat(image.x);
        image.y = parseFloat(image.y);
        image.heightToWidthRatio = parseFloat(image.heightToWidthRatio);
        image.zoom = parseFloat(image.zoom);
        var imageName = image.name.substr(0, image.name.lastIndexOf(".")) + ".dzi";
        sources.push({
            tileSource: "images/" + imageName,
            x: image.x - getRealWidth(image) / 2,
            y: image.y - getRealHeight(image) / 2,
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
    for (let i = 0; i < 25 && overlapping; i++) {
        overlapping = false;
        for (let i = 0; i < images.length; i++) align(images[i], images, i);
    }
}

function align(a, images, i) {
    var output = { x: 0, y: 0 };
    images.forEach((b) => {
        if (a.name === b.name) return;
        var intersection = getIntersection(a, b);
        if (!intersection) return;

        overlapping = true;

        var diff = getDistance(a, b);
        if (a.width < b.width / 2) {
            if (abs(diff.x) > abs(diff.y)) {
                output.x += self.sign(diff.x) * intersection.width;
            } else {
                output.y += self.sign(diff.y) * intersection.height;
            }
        } else {
            if (intersection.width < intersection.height) {
                output.x += self.sign(diff.x) * intersection.width;
            } else {
                output.y += self.sign(diff.y) * intersection.height;
            }
        }
    });
    if (output.x != 0 || output.y != 0) {
        moveImage(a, output, i);
        return;
    }
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
    var item = viewer.world.getItemAt(i);
    item.setPosition(
        new OpenSeadragon.Point(a.x - getRealWidth(a) / 2, a.y - getRealHeight(a) / 2)
    );
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
    if (a.isLandscape) return a.heightToWidthRatio / a.zoom;
    return 1 / a.zoom;
}

function getRealWidth(a) {
    if (a.isLandscape) return 1 / a.zoom;
    return 1 / (a.zoom * a.heightToWidthRatio);
}

function abs(a) {
    if (a < 0) return -a;
    return a;
}

function sign(a) {
    if (a < 0) return -1.05;
    return 1.05;
}
