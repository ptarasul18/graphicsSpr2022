// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
													// (x,y,z,w)position + (r,g,b)color
													// Later, see if you can add:
													// (x,y,z) surface normal + (tx,ty) texture addr.
var gl;													// WebGL rendering context -- the 'webGL' object
                                                    // in JavaScript with all its member fcns & data
// var g_canvasID;									// HTML-5 'canvas' element ID#. (was 'canvas')

function main() {
    //==============================================================================
      // Retrieve <canvas> element
      var canvas = document.getElementById('webgl');
    
      // Get the rendering context for WebGL
      gl = getWebGLContext(canvas);
      if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
      }
    
      // Initialize shaders
      if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
      }
    
      // 
      var n = initVertexBuffer(gl);
      if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
      }
    
      // Specify the color for clearing <canvas>
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
        // NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
        // unless the new Z value is closer to the eye than the old one..
    //	gl.depthFunc(gl.LESS);			 // WebGL default setting: (default)
        gl.enable(gl.DEPTH_TEST); 	  
        
      // Get handle to graphics system's storage location of u_ModelMatrix
      var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
      if (!u_ModelMatrix) { 
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
      }
      // Create a local version of our model matrix in JavaScript 
      var modelMatrix = new Matrix4();
      
      // Create, init current rotation angle value in JavaScript
      var currentAngle = 0.0;
    
    //-----------------  
    
      // Start drawing: create 'tick' variable whose value is this function:
      var tick = function() {
        currentAngle = animate(currentAngle);  // Update the rotation angle
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw shapes
        // report current angle on console
        //console.log('currentAngle=',currentAngle);
        requestAnimationFrame(tick, canvas);   
                                            // Request that the browser re-draw the webpage
      };
      tick();							// start (and continue) animation: draw current image
        
    }