// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
      gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setUpWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    } 
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_FragColor
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_Size
    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (!u_Size) {
    //     console.log('Failed to get the storage location of u_Size');
    //     return;
    // }
    // Get the storage location of u_FragColor
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// UI globals
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_globalX = 0;
let g_globalY=0;
let g_globalZ=0;
let g_origin = [0, 0];

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){

    // Button Events
    document.getElementById('animationYellowOnButton').onclick = function () { g_yellowAnimation = true; };
    document.getElementById('animationYellowOffButton').onclick = function () { g_yellowAnimation = false; };

    document.getElementById('animationMagentaOnButton').onclick = function () { g_magentaAnimation = true; };
    document.getElementById('animationMagentaOffButton').onclick = function () { g_magentaAnimation = false; };
    
    document.getElementById('reset').onclick = function () { reset(); };
    // document.getElementById('triButton').onclick = function () { g_selectedType = TRIANGLE };
    // document.getElementById('cirButton').onclick = function () { g_selectedType = CIRCLE };

    // Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

    // document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; });
    document.getElementById('yellowSlide').addEventListener('mousemove',  function() { g_yellowAngle = this.value; renderAllShapes();  });
    document.getElementById('magentaSlide').addEventListener('mousemove',  function() { g_magentaAngle = this.value; renderAllShapes();  });  
    document.getElementById('angleSlide').addEventListener('mousemove',  function() { g_globalAngle = this.value; renderAllShapes();  }); 

}
function reset() {


g_globalX=0;
g_globalY=0;
g_globalZ=0;
g_origin;
renderAllShapes();
}
function main() {
    // Set up the canvas and gl variables
    setUpWebGL();
    // Set up GLSL shader programs and connect GLSL variables 
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = originCoords;
    canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
} 

var g_shapesList = [];

// // var g_points = [];  // The array for the position of a mouse press
// // var g_colors = [];  // The array to store the color of a point
// // var g_sizes = []    // The array to store the sizes of a point

function click(ev) {
    
    // Extract the event click and return it in WebGL coordinates 
    let coordinates = convertCoordinatesEventToGL(ev);
    
    g_globalX = g_globalX - coordinates[0]*360;
    g_globalY = g_globalY - coordinates[1]*360;

    // Store the coordinates to g_points array
    // g_points.push([x, y]);

    // Store the color to g_colors array
    // g_colors.push(g_selectedColor.slice());

    // Store the size to g_sizes array
    // g_sizes.push(g_selectedSize);

    // Store the coordinates to g_points array
    //if (x >= 0.0 && y >= 0.0) {      // First quadrant
    //    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    //} else if (x < 0.0 && y < 0.0) { // Third quadrant
    //    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    //} else {                         // Others
    //    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    //}

    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();
}
function originCoords(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    g_origin = [x, y];
}
    // Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev){
        var x = ev.clientX; // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer

        let temp = [x,y];
        x = (x - g_origin[0])/400;
        y = (y - g_origin[1])/400;
        g_origin = temp;
        return([x,y]);
}
var g_startTime=performance.now() / 1000.0;
var g_seconds=performance.now() / 1000.0 - g_startTime;

function tick() {
  
  g_seconds = performance.now() / 1000.0 - g_startTime;
  console.log(performance.now());

  updateAnimation();
  renderAllShapes();
  
  
  requestAnimationFrame(tick);
}

function updateAnimation(){
    if (g_yellowAnimation){
        g_yellowAngle = (45*Math.sin(g_seconds));
    }
    if (g_magentaAnimation){
        g_magentaAngle = (-45*Math.sin(g_seconds));
    }
}
    // Draw every shape that is supposed to be in the canvas
function renderAllShapes(){

    var startTime = performance.now()

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    globalRotMat.rotate(g_globalX,1,0,0); // x-axis
    globalRotMat.rotate(g_globalY,0,1,0); // y-axis
    globalRotMat.rotate(g_globalZ,0,0,1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var len = g_shapesList.length;
    // for (var i = 0; i < len; i++) {
    //     g_shapesList[i].render();
    // }

    //left leg
    var body = new Cube();
    body.color = [1.0 ,0.0, 0.0, 1.0]
    body.matrix.translate(-.25, -.7, 0.0);
    body.matrix.scale(0.25, 0.5, 0.25);
    var legCord = new Matrix4(body.matrix)
    body.render()

    //right leg
    var legtwo = new Cube();
    legtwo.color = [1.0 ,0.5, 0.0, 1.0]
    legtwo.matrix = legCord
    legtwo.matrix.translate(0, 0, 1.0);
    legtwo.matrix.scale(1, 1, 1);
    legtwo.render()

    var shoeone = new Cube();
    shoeone.color = [0.2 ,0.2, 0.2, 1.0]
    shoeone.matrix = legCord
    shoeone.matrix.translate(0.1, -0.3, -0.0001);
    shoeone.matrix.scale(1, 0.5, 1);
    shoeone.render()

    var shoetwo = new Cube();
    shoetwo.color = [0.2 ,0.2, 0.2, 1.0]
    shoetwo.matrix = legCord
    shoetwo.matrix.translate(0, 0, -1.1);
    shoetwo.matrix.scale(1, 1, 1);
    shoetwo.render()

    //body
    var leftArm = new Cube();
    leftArm.color = [1.0 ,0.4, 0.0, 1.0]
    leftArm.matrix.translate(-0.25, -.2, 0.0);
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    
    var yellowCoordinateMat = new Matrix4 (leftArm.matrix);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.render();

    // head
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix = yellowCoordinateMat;
    box.matrix.translate(0, .7, 0.1);
    
    box.matrix.rotate(g_magentaAngle, 0, 0, 1);
    var headcord = new Matrix4 (box.matrix);
    box.matrix.scale(.3, .3, .3);
    box.render();

    //earbud 1
    var earbud1 = new Cube();
    earbud1.color = [0.5,0.5,0.5,0.5];
    earbud1.matrix = headcord;
    earbud1.matrix.translate(0.1, 0.25, -0.05);
    earbud1.matrix.rotate(g_magentaAngle, 0, 0, 1);
    
    earbud1.matrix.scale(.1, .1, .1);
    earbud1.render();

    //earbud 2
    var earbud2 = new Cube();
    earbud2.color = [0.5,0.5,0.5,0.5];
    earbud2.matrix = headcord;
    earbud2.matrix.translate(-0.2, 0, 3.3);
    earbud2.matrix.rotate(g_magentaAngle, 0, 0, 1);
    
    earbud2.matrix.scale(1, 1, 1);
    earbud2.render();
    
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "performance")

}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID +" from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
