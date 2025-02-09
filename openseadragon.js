console.time('loadingTime')
const urlParams = new URLSearchParams(window.location.search);
const image = urlParams.get("image");
const mode = urlParams.get("mode");

const retrievedObject = localStorage.getItem("images");
const parsedImages = JSON.parse(retrievedObject);

var overlapping;
var regularZoom = true;
var realPosition = true;
var overlappingSet = false;

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
    homeButton: "home",
    fullPageButton: "full-page",

    id: "openseadragon1",
    prefixUrl: "openseadragon/images/",
    tileSources: sources,

    showNavigator: true,
    preserveViewport: true,
    maxZoomPixelRatio: 3, // for videos
});

viewer.zoomPerClick = 1;

viewer.addHandler("open", function () {
    if (mode === "single" || parsedImages.size == 1) return;
    //distribute(parsedImages); // testing
    console.timeEnd('loadingTime')
});

viewer.addHandler("canvas-click", function (event) {
    if (!event.quick) return;
    if (mode === "single") {
        localStorage.setItem("navigate", image);
        console.log("Navigate: " + image);
        window.dispatchEvent(new Event("storage"));
        return;
    }
    var viewportPoint = viewer.viewport.pointFromPixel(event.position);
    console.log(viewportPoint);
    for (let i = 0; i < viewer.world.getItemCount(); i++) {
        let a = viewer.world.getItemAt(i);
        let bounds = a.getBounds();
        console.log(bounds);
        if (
            viewportPoint.x < bounds.x ||
            viewportPoint.x > bounds.x + bounds.width ||
            viewportPoint.y < bounds.y ||
            viewportPoint.y > bounds.y + bounds.height
        )
            continue;
        console.log("Navigate: " + parsedImages[i].name);
        localStorage.setItem("navigate", parsedImages[i].name);
        return;
    }
});

function distrib() {
    if (mode === "single" || parsedImages.size == 1) return;
    overlappingSet = !overlappingSet;

    if (overlappingSet) {
        document.getElementById("overlap").style.display = "inline";
        document.getElementById("distribute").style.display = "none";
    } else {
        document.getElementById("overlap").style.display = "none";
        document.getElementById("distribute").style.display = "inline";
    }

    recalculate();
    distribute(parsedImages);
}

function distribute(images) {
    if (!overlappingSet) return;
    console.time('overlappingSolver');
    //return;  // TODO
    overlapping = true;
    for (let i = 0; overlapping; i++) {
        console.log("i: " + i);
        overlapping = false;
        for (let i = 0; i < images.length; i++) align(images[i], images, i);
    }
    console.timeEnd('overlappingSolver');
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

    const margin = 0.01;
    left -= margin;
    right += margin;
    top += margin;
    bottom -= margin;

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
    const speed = 1.0; // testing
    a.x += output.x * speed;
    a.y += output.y * speed;
    var item = viewer.world.getItemAt(i);
    item.setPosition(new OpenSeadragon.Point(a.x - getWidth(a) / 2, a.y - getHeight(a) / 2));
}

function invertZoom() {
    if (mode === "single" || parsedImages.size == 1) return;
    regularZoom = !regularZoom;
    if (regularZoom) {
        document.getElementById("invert-zoom").style.display = "inline";
        document.getElementById("regular-zoom").style.display = "none";
    } else {
        document.getElementById("invert-zoom").style.display = "none";
        document.getElementById("regular-zoom").style.display = "inline";
    }

    recalculate();
}

function togglePosition() {
    if (mode === "single" || parsedImages.size == 1) return;
    realPosition = !realPosition;
    if (realPosition) {
        document.getElementById("intersection-position").style.display = "inline";
        document.getElementById("real-position").style.display = "none";
    } else {
        document.getElementById("intersection-position").style.display = "none";
        document.getElementById("real-position").style.display = "inline";
    }

    recalculate();
}

function recalculate() {
    console.log(
        "Recalculating. Real position: " + realPosition + ". Regular zoom: " + regularZoom + "."
    );
    for (let i = 0; i < parsedImages.length; i++) {
        const a = parsedImages[i];
        var item = viewer.world.getItemAt(i);
        var centerPos = getCenterPosition(a);
        a.x = parseFloat(centerPos.x);
        a.y = parseFloat(centerPos.y);
        item.setHeight(getHeight(a));
        item.setPosition(new OpenSeadragon.Point(a.x - getWidth(a) / 2, a.y - getHeight(a) / 2));
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
