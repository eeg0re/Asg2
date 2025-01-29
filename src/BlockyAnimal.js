// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let canvas;
let gl;

// shader variables used to pass JS info to WebGL
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// UI variables
let g_selectedSize = 10; 
let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSegments = 10;
let g_globalAngle = 0.0;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    // enable depth test
    gl.enable(gl.DEPTH_TEST);

    colorCanvas = document.getElementById("colorCanvas");
    colorgl = colorCanvas.getContext("webgl", { preserveDrawingBuffer: true });
    if(!colorgl){
        console.log("Failed to get the rendering context for colorCanvas");
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to intialize shaders.");
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (!u_FragColor) {
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    if(!u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
    if(!u_GlobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    let identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // -------- shapes list ----------------
    // commented out temporarily -----------
    // let len = g_shapesList.length;
    // for(let i = 0; i < len; i++){
    //     g_shapesList[i].render();
    // }
    // -------------------------------------

    //drawTriangle3D([-1.0,0.0,0.0, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0]);

    // pass the matrix to rotate the shape
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    let body = new Cube();
    body.color = [0.0, 0.0, 1.0, 1.0];
    body.matrix.translate(-0.25, -0.5, 0.0);
    body.matrix.scale(0.5, 1.0, 0.5);
    body.render();

    let leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.translate(0.7, 0.0, 0.0);
    leftArm.matrix.rotate(45, 0, 0, 1);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.render();
}

function convertCoords(ev) {
    let x = ev.clientX; // x coordinate of a mouse pointer
    let y = ev.clientY; // y coordinate of a mouse pointer
    let rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

let g_shapesList = [];

function click(ev) {
    // convert the x and y coordinates to match the canvas's coordinate system
    let [x, y] = convertCoords(ev);

    // create and store the new point based on what we're drawing
    let point;
    if (g_selectedType == POINT){
        point = new Point();
    }
    else if (g_selectedType == TRIANGLE){
        point = new Triangle();
    }
    else{
        point = new Circle(g_selectedSegments);
    }
    point.position = [x, y, 0.0, 0.0];
    point.size = g_selectedSize;
    point.color = g_selectedColor.slice();
    g_shapesList.push(point);

    renderAllShapes();
}

function convertCoordinatesForTriangle(x1, y1, x2, y2, x3, y3){
    let scaler = 15
    return [x1/scaler, y1/scaler, x2/scaler, y2/scaler, x3/scaler, y3/scaler];
}

function drawPicture(){
    g_shapesList = [];
    let blue = [0.275, 0.608, 1, 1];
    let skinTone = [0.769, 0.635, 0.459, 1];
    let grey = [0.361, 0.361, 0.361, 1];

    let triangles = [
        { "vertices": convertCoordinatesForTriangle(0,0, -1,1, 1,1), "color": blue},    // bottom nose
        { "vertices": convertCoordinatesForTriangle(-1,1, 0,3, 1, 1), "color": blue },  // top nose
        { "vertices": convertCoordinatesForTriangle(-1,1, -1,3, 0,3), "color": [0, 0, 0, 1] },          // left of nose
        { "vertices": convertCoordinatesForTriangle(1,1, 1,3, 0,3), "color": [0, 0, 0, 1] },            // right of nose
        { "vertices": convertCoordinatesForTriangle(-1,3, -3,3, -3,4), "color": [1, 1, 1, 1] },         // left eye
        { "vertices": convertCoordinatesForTriangle(1,3, 3,3, 3,4), "color": [1, 1, 1, 1] },            // right eye
        // connect eyes to cowl
        { "vertices": convertCoordinatesForTriangle(-3,3, -3,4, -4,3), "color": blue }, // left eye to cowl
        { "vertices": convertCoordinatesForTriangle(3,3, 3,4, 4,3), "color": blue },    // right eye to cowl
        { "vertices": convertCoordinatesForTriangle(-1,3, 0,4, 1, 3), "color": blue },       // btwn eyes
        { "vertices": convertCoordinatesForTriangle(-4,3, -4,4, -3,4), "color": blue },
        { "vertices": convertCoordinatesForTriangle(4,3, 4,4, 3,4), "color": blue },
        { "vertices": convertCoordinatesForTriangle(1,1, 1,3, 3,3), "color": blue },
        { "vertices": convertCoordinatesForTriangle(-1,1, -1,3, -3,3), "color": blue },
        { "vertices": convertCoordinatesForTriangle(1,1, 1,3, 3,3), "color": blue },
        { "vertices": convertCoordinatesForTriangle(-3,4 , 0,6, 3,4 ), "color": blue }, // top of head
        { "vertices": convertCoordinatesForTriangle(-1,1, -3,1, -3,3), "color": blue }, // under left eye
        { "vertices": convertCoordinatesForTriangle(1,1, 3,1, 3,3), "color": blue },    // under right eye
        { "vertices": convertCoordinatesForTriangle(-3,1, -3,3, -4,3), "color": blue }, // left of head
        { "vertices": convertCoordinatesForTriangle(3,1, 3,3, 4,3), "color": blue },    // right of head
        { "vertices": convertCoordinatesForTriangle(-3,5, -4,5, -3,7), "color": blue }, // left bat ear pt 1
        { "vertices": convertCoordinatesForTriangle(-4,5, -4,7, -3,7), "color": blue }, // left bat ear pt 2
        { "vertices": convertCoordinatesForTriangle(-3,7 , -4,7, -3,10), "color": blue }, // left bat ear pt 3
        { "vertices": convertCoordinatesForTriangle(-4,4, -4,5, -3, 5), "color": blue }, // left bat ear pt 5
        { "vertices": convertCoordinatesForTriangle(-3,4, -4,4, -3, 5), "color": blue }, // left bat ear pt 6
        { "vertices": convertCoordinatesForTriangle(-3,4, -3,5, -2, 5), "color": blue },  // left bat ear pt 7
        { "vertices": convertCoordinatesForTriangle(3,5, 3,7, 4,5), "color": blue },    // right bat ear pt 1
        { "vertices": convertCoordinatesForTriangle(4,5, 4,7, 3,7), "color": blue },    // right bat ear pt 2
        { "vertices": convertCoordinatesForTriangle(3,7, 4,7, 3,10), "color": blue },   // right bat ear pt 3
        { "vertices": convertCoordinatesForTriangle(4,4, 4,5, 3, 5), "color": blue},    // right bat ear pt 5
        { "vertices": convertCoordinatesForTriangle(3,4, 4,4, 3, 5), "color": blue},    // right bat ear pt 6
        { "vertices": convertCoordinatesForTriangle(3,4, 3,5, 2, 5), "color": blue},    // right bat ear pt 7
        { "vertices": convertCoordinatesForTriangle(-2,1, -3,1, -2.5,-2), "color": blue}, // left bottom cowl
        { "vertices": convertCoordinatesForTriangle(2,1, 3,1, 2.5,-2), "color": blue},    // right bottom cowl
        { "vertices": convertCoordinatesForTriangle(-2.5,-2, 0,-3, 2.5,-2), "color": skinTone},    // bottom cowl/face
        { "vertices": convertCoordinatesForTriangle(-4,1, -4,-7, -5,-7), "color": blue},   // left neck piece
        { "vertices": convertCoordinatesForTriangle(-1,-4, -1.5,-4, -1, -7), "color": blue },  // left neck shadow
        { "vertices": convertCoordinatesForTriangle(-4,-6, -4,-7, -13.5, -7), "color": blue},  // left cape piece
        { "vertices": convertCoordinatesForTriangle(4,1, 4,-7, 5,-7), "color": blue},    // right neck piece
        { "vertices": convertCoordinatesForTriangle(1,-4, 1.5,-4, 1, -7), "color": blue },  // right neck shadow
        { "vertices": convertCoordinatesForTriangle(4,-6, 4,-7, 13.5, -7), "color": blue},  // right cape piece
        { "vertices": convertCoordinatesForTriangle(-1,-9, -3,-9, -1,-10), "color": grey},  // left collar bone
        { "vertices": convertCoordinatesForTriangle(1,-9, 3,-9, 1,-10), "color": grey},  // right collar bone

    ];     // will hold the triangle info for each triangle in the picture

    let tri;
    for (let i = 0; i < triangles.length; i++){
        tri = new Triangle(triangles[i]["vertices"]);
        tri.position = [0.0, 0.0, 0.0, 0.0];
        tri.color = triangles[i]["color"];
        g_shapesList.push(tri);
    }
    renderAllShapes();
}

function updateColor(){
    colorgl.clearColor(g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]); 
    colorgl.clear(colorgl.COLOR_BUFFER_BIT);
}

function setupHTMLElements(){
   
    // sliders
    document.getElementById("redSlider").addEventListener("mouseup", function () { g_selectedColor[0] = this.value / 100; updateColor(); } );
    document.getElementById("greenSlider").addEventListener("mouseup", function () { g_selectedColor[1] = this.value / 100; updateColor(); } );
    document.getElementById("blueSlider").addEventListener("mouseup", function () { g_selectedColor[2] = this.value / 100; updateColor(); } );
    document.getElementById("sizeSlider").addEventListener("mouseup", function () { g_selectedSize = this.value } );
    document.getElementById("circleSegmentSlider").addEventListener("mouseup", function () { g_selectedSegments = this.value} );
    document.getElementById("angleSlider").addEventListener("mouseup", function () { g_globalAngle = this.value; renderAllShapes(); } );

    // buttons 
    document.getElementById("clear").onclick = function () { g_shapesList = []; renderAllShapes(); };
    document.getElementById("pointBttn").onclick = function () { g_selectedType = POINT; };
    document.getElementById("triBttn").onclick = function () { g_selectedType = TRIANGLE; };
    document.getElementById("circleBttn").onclick = function() { g_selectedType = CIRCLE; };
    document.getElementById("pictureBttn").onclick = function () { drawPicture(); };
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    setupHTMLElements();

    // Register function (event handler) to be called on a mouse press
    
    // canvas.onmousedown = function (ev) {
    //     click(ev);
    // };

    // canvas.onmousemove = function (ev) {
    //     if (ev.buttons === 1) {
    //         click(ev);
    //     }
    // }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderAllShapes();
}