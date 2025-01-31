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
let g_globalAngleX = 0.0;
let g_globalAngleY = 0.0;
let g_armAngle = 0.0;
let g_lowerArmAngle = 0.0;
let g_animationOn = false;

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

function updateAnimationAngles(){
    if(g_animationOn){
        g_armAngle = (45*Math.sin(g_seconds));
    }
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
    let globalRotMat = new Matrix4().rotate(g_globalAngleX, g_globalAngleY, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    let body = new Cube();
    body.color = [0.0, 0.0, 1.0, 1.0];
    body.matrix.translate(-0.25, -0.75, 0.0);
    body.matrix.scale(0.5, 0.3, 0.5);
    body.render();
    
    let ear = new Cone(8);
    ear.color = [1.0, 0.0, 0.0, 1.0];
    ear.matrix.translate(-0.25, -0.25, 0.0);
    ear.matrix.rotate(90, 0, 1, 0);
    ear.render();
    // let leftArm = new Cube();
    // leftArm.color = [1.0, 1.0, 0.0, 1.0];
    // leftArm.matrix.setTranslate(0, -0.5, 0.0);
    // leftArm.matrix.rotate(-5, 1, 0, 0);
    // leftArm.matrix.rotate(-g_armAngle, 0, 0, 1);
    
    // let leftArmMatrix = new Matrix4(leftArm.matrix);    // save the matrix before we scale it
    // leftArm.matrix.scale(0.25, 0.7, 0.5);
    // leftArm.matrix.translate(-0.5, 0, 0);
    // leftArm.render();
    
    // let topArm = new Cube();
    // topArm.color = [0.8, 1.0, 0.5, 1.0];
    // topArm.matrix = leftArmMatrix;
    // topArm.matrix.translate(0.0, 0.65, 0.0);
    // topArm.matrix.rotate(g_lowerArmAngle, 1, 0, 0);
    // topArm.matrix.scale(0.3, 0.3, 0.3);
    // topArm.matrix.translate(-0.5, 0, -0.001);
    // topArm.render();

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


function updateColor(){
    colorgl.clearColor(g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]); 
    colorgl.clear(colorgl.COLOR_BUFFER_BIT);
}

function setupHTMLElements(){
   
    // sliders
    document.getElementById("angleSliderX").addEventListener("mousemove", function () { g_globalAngleX = this.value; renderAllShapes(); } );
    document.getElementById("angleSliderY").addEventListener("mousemove", function () { g_globalAngleY = this.value; renderAllShapes(); } );
    document.getElementById("armSlider").addEventListener("mousemove", function () { g_armAngle = this.value; renderAllShapes(); } );
    document.getElementById("lowerArmSlider").addEventListener("mousemove", function () { g_lowerArmAngle = this.value; renderAllShapes(); } );

    // Buttons 
    document.getElementById("animationBttn").onclick = function () { g_animationOn = true };
    document.getElementById("animationOffBttn").onclick = function () { g_animationOn = false };
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    console.log(g_seconds);
    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
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
    requestAnimationFrame(tick);
}