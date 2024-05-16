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
        image.height = parseFloat(image.height);
        image.width = parseFloat(image.width);
        image.zoom = parseFloat(image.zoom);
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
    while (overlapping) {
        console.log("--------");
        overlapping = false;
        for (let i = 0; i < images.length; i++) align(images[i], images, i);
    }
}

function align(a, images, i) {
    console.log("ALIGNING: " + a.name);
    console.log(getLeft(a) + "," + getRight(a) + "," + getTop(a) + "," + getBottom(a));
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
        var diff = getDistance(a, b);
        console.log("DIFF");
        console.log(diff);
        //console.log("Distance: " + dist.x + ", " + dist.y);
        console.log("INTERSECTION: " + intersection.width + ", " + intersection.height);
        if (a.width < b.width / 2) {
            if (abs(diff.x) > abs(diff.y)) {
                output.y += self.sign(diff.y) * intersection.height;
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
        console.log("output: " + output.x + ", " + output.y);
        if (output.x != 0 || output.y != 0) {
            moveImage(a, output, i);
            return;
        }
    });
}

function getIntersection(a, b) {
    console.log("A");
    console.log("top: " + getTop(a));
    console.log("bottom: " + getBottom(a));
    console.log("left: " + getLeft(a));
    console.log("right: " + getRight(a));
    console.log("B");
    console.log("top: " + getTop(b));
    console.log("bottom: " + getBottom(b));
    console.log("left: " + getLeft(a));
    console.log("right: " + getRight(b));

    var left = max(getLeft(a), getLeft(b));
    var top = min(getTop(a), getTop(b));
    var right = min(getRight(a), getRight(b));
    var bottom = max(getBottom(a), getBottom(b));
    console.log("I");
    console.log("top: " + top);
    console.log("bottom: " + bottom);
    console.log("left: " + left);
    console.log("right: " + right);

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
    console.log("BEFORE");
    console.log(a.name + ": " + a.x + ", " + a.y);
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
    console.log("Get dist");
    console.log(a.x);
    console.log(b.x);
    console.log(a.y);
    console.log(b.y);
    return { x: a.x - b.x, y: a.y - b.y };
}

function getRealHeight(a) {
    return a.height / a.zoom;
}

function getRealWidth(a) {
    return a.width / a.zoom;
}

function abs(a) {
    if (a < 0) return -a;
    return a;
}

function sign(a) {
    if (a < 0) return -1;
    return 1;
}
