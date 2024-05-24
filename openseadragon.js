const urlParams = new URLSearchParams(window.location.search);
const image = urlParams.get("image");
const mode = urlParams.get("mode");

const retrievedObject = localStorage.getItem("images");
const parsedImages = JSON.parse(retrievedObject);

var overlapping;
var regularZoom = true;
var realPosition = true;

console.log(mode);
console.log(image);

var sources = [];

if (mode === "single") {
    var imageName = image.substr(0, image.lastIndexOf(".")) + ".dzi";
    sources.push("images/" + imageName);
} else {
    console.log(parsedImages);
    parsedImages.forEach((image) => {
        const centerPos = getCenterPosition(image);
        image.x = parseFloat(centerPos.x);
        image.y = parseFloat(centerPos.y);
        image.heightToWidthRatio = parseFloat(image.heightToWidthRatio);
        image.zoom = parseFloat(image.zoom);
        var imageName = image.name.substr(0, image.name.lastIndexOf(".")) + ".dzi";
        const cornerPos = getCornerPosition(image);
        sources.push({
            tileSource: "images/" + imageName,
            x: cornerPos.x,
            y: cornerPos.y,
            height: getHeight(image),
        });
    });
}

var viewer = OpenSeadragon({
    zoomInButton: "zoom-in",
    zoomOutButton: "zoom-out",
    homeButton: "home",
    fullPageButton: "full-page",

    id: "openseadragon1",
    prefixUrl: "openseadragon/images/",
    tileSources: sources,

    showNavigator: true,
    preserveViewport: true,
});

viewer.addHandler("open", function () {
    distribute(parsedImages);
});

function distribute(images) {
    overlapping = true;
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
    item.setPosition(new OpenSeadragon.Point(a.x - getHeight(a) / 2, a.y - getHeight(a) / 2));
}

function invertZoom() {
    regularZoom = !regularZoom;
    if (regularZoom) {
        document.getElementById("invert-zoom").style.display = "inline";
        document.getElementById("regular-zoom").style.display = "none";
    } else {
        document.getElementById("invert-zoom").style.display = "none";
        document.getElementById("regular-zoom").style.display = "inline";
    }

    for (let i = 0; i < parsedImages.length; i++) {
        const a = parsedImages[i];
        var item = viewer.world.getItemAt(i);
        //var cornerPos = getCornerPosition(a);
        //var centerPos = getCenterPosition(a);
        //a.x = parseFloat(centerPos.x);
        //a.y = parseFloat(centerPos.y);
        item.setHeight(getHeight(a));
        item.setPosition(new OpenSeadragon.Point(a.x - getWidth(a) / 2, a.y - getHeight(a) / 2));
        //item.setPosition(new OpenSeadragon.Point(cornerPos.x, cornerPos.y));
    }
    distribute(parsedImages);
}

function togglePosition() {
    realPosition = !realPosition;
    if (realPosition) {
        document.getElementById("intersection-position").style.display = "inline";
        document.getElementById("real-position").style.display = "none";
    } else {
        document.getElementById("intersection-position").style.display = "none";
        document.getElementById("real-position").style.display = "inline";
    }

    for (let i = 0; i < parsedImages.length; i++) {
        const a = parsedImages[i];
        var item = viewer.world.getItemAt(i);
        //var cornerPos = getCornerPosition(a);
        var centerPos = getCenterPosition(a);
        a.x = parseFloat(centerPos.x);
        a.y = parseFloat(centerPos.y);
        item.setHeight(getHeight(a));
        item.setPosition(new OpenSeadragon.Point(a.x - getWidth(a) / 2, a.y - getHeight(a) / 2));
        //item.setPosition(new OpenSeadragon.Point(cornerPos.x, cornerPos.y));
    }
    distribute(parsedImages);
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
    return a.x - getWidth(a) / 2;
}

function getRight(a) {
    return a.x + getWidth(a) / 2;
}

function getTop(a) {
    return a.y + getHeight(a) / 2;
}

function getBottom(a) {
    return a.y - getHeight(a) / 2;
}

function getDistance(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}

function getHeight(a) {
    if (regularZoom) return getRealHeight(a);
    return getOppositeHeight(a);
}

function getWidth(a) {
    if (regularZoom) return getRealWidth(a);
    return getOppositeWidth(a);
}

function getCenterPosition(a) {
    if (realPosition) return { x: a.x_real, y: a.y_real };
    return { x: a.x_inter, y: a.y_inter };
}

function getCornerPosition(a) {
    if (realPosition) return { x: a.x_real - getWidth(a) / 2, y: a.y_real - getHeight(a) };
    return { x: a.x_inter - getWidth(a), y: a.y_inter - getHeight(a) };
}

function getRealHeight(a) {
    if (a.isLandscape) return a.heightToWidthRatio / a.zoom;
    return 1 / a.zoom;
}

function getRealWidth(a) {
    if (a.isLandscape) return 1 / a.zoom;
    return 1 / (a.zoom * a.heightToWidthRatio);
}

function getOppositeHeight(a) {
    if (a.isLandscape) return (a.heightToWidthRatio * a.zoom) / 3;
    return a.zoom / 3;
}

function getOppositeWidth(a) {
    if (a.isLandscape) return a.zoom / 3;
    return a.zoom / (3 * a.heightToWidthRatio);
}

function abs(a) {
    if (a < 0) return -a;
    return a;
}

function sign(a) {
    if (a < 0) return -1.01;
    return 1.01;
}
