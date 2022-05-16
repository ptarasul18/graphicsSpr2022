//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda AND
// Chapter 2: ColoredPoints.js (c) 2012 matsuda
//
// merged and modified to became:
//
// ControlMulti.js for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

//		--converted from 2D to 4D (x,y,z,w) vertices
//		--demonstrate how to keep & use MULTIPLE colored shapes 
//			in just one Vertex Buffer Object(VBO).
//		--demonstrate several different user I/O methods: 
//				--Webpage pushbuttons 
//				--Webpage edit-box text, and 'innerHTML' for text display
//				--Mouse click & drag within our WebGL-hosting 'canvas'
//				--Keyboard input: alphanumeric + 'special' keys (arrows, etc)
//
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
// =========================
// Use globals to avoid needlessly complex & tiresome function argument lists,
// and for user-adjustable controls.
// For example, the WebGL rendering context 'gl' gets used in almost every fcn;
// requiring 'gl' as an argument won't give us any added 'encapsulation'; make
// it global.  Later, if the # of global vars grows too large, we can put them 
// into one (or just a few) sensible global objects for better modularity.
//------------For WebGL-----------------------------------------------
var gl;           // webGL Rendering Context. Set in main(), used everywhere.
var g_canvas = document.getElementById('webgl');     
                  // our HTML-5 canvas object that uses 'gl' for drawing.
                  
// ----------For tetrahedron & its matrix---------------------------------
var g_vertsMax = 0;                 // number of vertices held in the VBO 
                                    // (global: replaces local 'n' variable)
var g_modelMatrix = new Matrix4();  // Construct 4x4 matrix; contents get sent
                                    // to the GPU/Shaders as a 'uniform' var.
var g_modelMatLoc;                  // that uniform's location in the GPU
var floatsPerVertex = 7;

//------------For Animation---------------------------------------------
var g_isRun = true;                 // run/stop for animation; used in tick().
var g_lastMS = Date.now();    			// Timestamp for most-recently-drawn image; 
                                    // in milliseconds; used by 'animate()' fcn 
                                    // (now called 'timerAll()' ) to find time
                                    // elapsed since last on-screen image.
var g_angle01 = 0;                  // initial rotation angle
var g_angle01Rate = 45.0;           // rotation speed, in degrees/second 
// var g_angle0brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
// var g_angle0min  =-140.0;       // init min, max allowed angle, in degrees.
// var g_angle0max  =  40.0;

var g_angle02 = 0;                  // initial rotation angle
var g_angle02Rate = 40.0;           // rotation speed, in degrees/second

var g_angle03 = 0;                  // initial rotation angle
var g_angle03Rate = 40.0;           // rotation speed, in degrees/second

//Robot arm angles
var g_angle0now  =   0.0;       // init Current rotation angle, in degrees
var g_angle0rate = -22.0;       // init Rotation angle rate, in degrees/second.
var g_angle0brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle0min  =-140.0;       // init min, max allowed angle, in degrees.
var g_angle0max  =  40.0;
                                //---------------
var g_angle1now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle1rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle1brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle1min  = -80.0;       // init min, max allowed angle, in degrees
var g_angle1max  =  80.0;
                                //---------------
var g_angle2now  =   0.0; 			// init Current rotation angle, in degrees.
var g_angle2rate =  89.0;				// init Rotation angle rate, in degrees/second.
var g_angle2brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle2min  = -40.0;       // init min, max allowed angle, in degrees
var g_angle2max  = -20.0;			

var g_angle3now  =   0.0; 			// init Current rotation angle, in degrees.
var g_angle3rate =  31.0;				// init Rotation angle rate, in degrees/second.
var g_angle3brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle3min  = -40.0;       // init min, max allowed angle, in degrees
var g_angle3max  =  40.0;			

//Wheel stuff
var wheelAngle = 0.0;
var angleStep = 45.0;
//need to add something so the whole assembly rotates, probably
//this could go in the drawall part
var rAngle = 0.0;
var rAngleStep = 30.0;
var leanAngle = 0.0;
var lAnglerate = 30.0;
var lAnglemin = -20.0;
var lAnglemax = 20.0;

//bike seat wiggles
var seatAngle = 0.0;
var seatRate = 45.0;
var sangleMax = 20.0;
var sangleMin = -20.0;

//unicycle side to side
var upos = 0.0;
var uspeed = 0.5;
// var uspeed = 0	.0;
var rlim = 3.0;
var llim = -3.0;

//bird angles
var bAngle1 = -38.0;
var bRate = 30.0;
var bMax = 0.0;
var bMin = -68.0;

//camera motion
var eyex = 5.0;
var eyey = 5.0;
var eyez = 2.0;

var theta = 4.0;
var tilt = -0.2;
var dist1 = 1.0;

// var aimx = eyex + Math.cos(theta) - 6.0;
var aimx = eyex + Math.cos(theta) * dist1;
// var aimy = eyey + Math.sin(theta) - 5.0;
var aimy = eyey + Math.sin(theta) * dist1;
// var aimz = eyez + tilt - 1.0;
var aimz = eyez + tilt;



//------------For mouse click-and-drag: -------------------------------
var g_isDrag=false;		// mouse-drag: true when user holds down mouse button
var g_xMclik=0.0;			// last mouse button-down position (in CVV coords)
var g_yMclik=0.0;   
var g_xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var g_yMdragTot=0.0; 
var g_digits=5;			// DIAGNOSTICS: # of digits to print in console.log (
									//    console.log('xVal:', xVal.toFixed(g_digits)); // print 5 digits
								 
var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();				// rotation matrix, made from latest qTot

function main() {
//==============================================================================
/*REPLACED THIS: 
// Retrieve <canvas> element:
 var canvas = document.getElementById('webgl'); 
//with global variable 'g_canvas' declared & set above.
*/
  
  // Get gl, the rendering context for WebGL, from our 'g_canvas' object
  gl = getWebGLContext(g_canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Initialize a Vertex Buffer in the graphics system to hold our vertices
  g_maxVerts = initVertexBuffer(gl);  
  if (g_maxVerts < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

	// Register the Keyboard & Mouse Event-handlers------------------------------
	// When users move, click or drag the mouse and when they press a key on the 
	// keyboard the operating system create a simple text-based 'event' message.
	// Your Javascript program can respond to 'events' if you:
	// a) tell JavaScript to 'listen' for each event that should trigger an
	//   action within your program: call the 'addEventListener()' function, and 
	// b) write your own 'event-handler' function for each of the user-triggered 
	//    actions; Javascript's 'event-listener' will call your 'event-handler'
	//		function each time it 'hears' the triggering event from users.
	//
  // KEYBOARD:
  // The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
  //      including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc. 
	window.addEventListener("keydown", myKeyDown, false);
	// After each 'keydown' event, call the 'myKeyDown()' function.  The 'false' 
	// arg (default) ensures myKeyDown() call in 'bubbling', not 'capture' stage)
	// ( https://www.w3schools.com/jsref/met_document_addeventlistener.asp )
	window.addEventListener("keyup", myKeyUp, false);
	// Called when user RELEASES the key.  Now rarely used...
	
	// MOUSE:
	// Create 'event listeners' for a few vital mouse events 
	// (others events are available too... google it!).  
	window.addEventListener("mousedown", myMouseDown); 
	// (After each 'mousedown' event, browser calls the myMouseDown() fcn.)
  window.addEventListener("mousemove", myMouseMove); 
	window.addEventListener("mouseup", myMouseUp);	
	window.addEventListener("click", myMouseClick);				
	window.addEventListener("dblclick", myMouseDblClick); 
	// Note that these 'event listeners' will respond to mouse click/drag 
	// ANYWHERE, as long as you begin in the browser window 'client area'.  
	// You can also make 'event listeners' that respond ONLY within an HTML-5 
	// element or division. For example, to 'listen' for 'mouse click' only
	// within the HTML-5 canvas where we draw our WebGL results, try:
	// g_canvasID.addEventListener("click", myCanvasClick);
  //
	// Wait wait wait -- these 'mouse listeners' just NAME the function called 
	// when the event occurs!   How do the functions get data about the event?
	//  ANSWER1:----- Look it up:
	//    All mouse-event handlers receive one unified 'mouse event' object:
	//	  https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
	//  ANSWER2:----- Investigate:
	// 		All Javascript functions have a built-in local variable/object named 
	//    'argument'.  It holds an array of all values (if any) found in within
	//	   the parintheses used in the function call.
  //     DETAILS:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
	// END Keyboard & Mouse Event-Handlers---------------------------------------
	
  // Specify the color for clearing <canvas>
  gl.clearColor(0.3, 0.3, 0.3, 1.0);

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// unless the new Z value is closer to the eye than the old one..
    //DEPTH TEST HERE
	gl.enable(gl.DEPTH_TEST); 
    // gl.clearDepth(0.0);	
    // gl.depthFunc(gl.GREATER);
	  
	
  // Get handle to graphics system's storage location of u_ModelMatrix
  g_modelMatLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!g_modelMatLoc) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
/* REPLACED by global var 'g_ModelMatrix' (declared, constructed at top)
  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
*/
/* REPLACED by global g_angle01 variable (declared at top)
  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
*/

//   var canv = function(){
// 	g_canvas.width = window.innerWidth;
// 	g_canvas.height = 0.66 * window.innerHeight;
//   };
  // ANIMATION: create 'tick' variable whose value is this function:
  //----------------- 
  var tick = function() {
    canv();
	animate();   // Update the rotation angle
    drawAll();   // Draw all parts
//    console.log('g_angle01=',g_angle01.toFixed(g_digits)); // put text in console.

//	Show some always-changing text in the webpage :  
//		--find the HTML element called 'CurAngleDisplay' in our HTML page,
//			 	(a <div> element placed just after our WebGL 'canvas' element)
// 				and replace it's internal HTML commands (if any) with some
//				on-screen text that reports our current angle value:
//		--HINT: don't confuse 'getElementByID() and 'getElementById()
		// document.getElementById('CurAngleDisplay').innerHTML= 
		// 	'g_angle01= '+g_angle01.toFixed(g_digits);
		// // Also display our current mouse-dragging state:
		// document.getElementById('Mouse').innerHTML=
		// 	'Mouse Drag totals (CVV coords):\t'+
		// 	g_xMdragTot.toFixed(5)+', \t'+g_yMdragTot.toFixed(g_digits);	
		//--------------------------------
    requestAnimationFrame(tick, g_canvas);   
    									// Request that the browser re-draw the webpage
    									// (causes webpage to endlessly re-draw itself)
  };
  tick();							// start (and continue) animation: draw current image
	
}
function canv(){
	g_canvas.width = window.innerWidth * 0.98;
	g_canvas.height = 0.66 * window.innerHeight;
}

function initVertexBuffer() {
//==============================================================================
// NOTE!  'gl' is now a global variable -- no longer needed as fcn argument!

	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);						 

    makeCylinder();
	makeAxle();
	makeHeart();
	makePrism();
	makeWing();
    makeGroundGrid();				// create, fill the gndVerts array
	makeAxes();
	
    
//   var mySiz = (cylVerts.length + triShapes.length + rVerts.length + axVerts.length);
  var mySiz = (cylVerts.length + axVerts.length + hVerts.length + 
	pVerts.length +wVerts.length + gndVerts.length + aVerts.length);

  g_vertsMax = mySiz / floatsPerVertex;		// 12 tetrahedron vertices.
  								// we can also draw any subset of these we wish,
  								// such as the last 3 vertices.(onscreen at upper right)
	
  var colorShapes = new Float32Array(mySiz);
  cylStart = 0;
  for(i=0,j=0; j< cylVerts.length; i++,j++) {
    colorShapes[i] = cylVerts[j];
      }
//   tristart = i;						// next, we'll store the sphere;
//   for(j=0; j< triShapes.length; i++, j++) {// don't initialize i -- reuse it!
//   	colorShapes[i] = triShapes[j];
//   }
//   rStart = i;
//   for(j=0; j< rVerts.length; i++, j++) {// don't initialize i -- reuse it!
// 	colorShapes[i] = rVerts[j];
//   }	
  axStart = i;
  
  for(j=0; j< axVerts.length; i++, j++) {// don't initialize i -- reuse it!
	colorShapes[i] = axVerts[j];
  }	
  hStart = i;
  for(j=0; j< hVerts.length; i++, j++) {// don't initialize i -- reuse it!
	colorShapes[i] = hVerts[j];
  }	
  pStart = i;
  for(j=0; j< pVerts.length; i++, j++) {// don't initialize i -- reuse it!
	colorShapes[i] = pVerts[j];
  }	
  wStart = i;
  for(j=0; j< pVerts.length; i++, j++) {// don't initialize i -- reuse it!
	colorShapes[i] = wVerts[j];
  }	
  gndStart = i;						// next we'll store the ground-plane;
  for(j=0; j< gndVerts.length; i++, j++) {
    colorShapes[i] = gndVerts[j];
  }
  aStart = i;
  for(j=0; j< aVerts.length; i++, j++) {
    colorShapes[i] = aVerts[j];
  }
  
    // Create a buffer object
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?
    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Use handle to specify how to retrieve position data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * floatsPerVertex, 		// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  		0);						// Offset -- now many bytes from START of buffer to the
  									// value we will actually use?
  gl.enableVertexAttribArray(a_Position);  
  									// Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(
  	a_Color, 				// choose Vertex Shader attribute to fill with data
  	3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
  	gl.FLOAT, 			// data type for each value: usually gl.FLOAT
  	false, 					// did we supply fixed-point data AND it needs normalizing?
  	FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  	FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w
  									
  gl.enableVertexAttribArray(a_Color);  
  									// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

/* REMOVED -- global 'g_vertsMax' means we don't need it anymore
  return nn;
*/
}

function drawAll() {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
// Great question from student:
// "?How can I get the screen-clearing color (or any of the many other state
//		variables of OpenGL)?  'glGet()' doesn't seem to work..."
// ANSWER: from WebGL specification page: 
//							https://www.khronos.org/registry/webgl/specs/1.0/
//	search for 'glGet()' (ctrl-f) yields:
//  OpenGL's 'glGet()' becomes WebGL's 'getParameter()'

	clrColr = new Float32Array(4);
	clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
    g_modelMatrix.setIdentity();
	pushMatrix(g_modelMatrix);
	
	znear = 1.0;
	zfar = 18.0;
	aspect = g_canvas.width / g_canvas.height;
	tb = ((zfar-znear)/3.0) * (Math.tan((35.0 * Math.PI) /360.0));
	// tb = ((zfar-znear)/3.0) * (Math.tan((35.0 * Math.PI) / 180.0)) * 0.5;
	lr = tb * aspect;
	
	
    g_modelMatrix.perspective(35.0,   // FOVY: top-to-bottom vertical image angle, in degrees
						aspect,   // Image Aspect Ratio: camera lens width/height
                        znear,   // camera z-near distance (always positive; frustum begins at z = -znear)
                    	zfar);  // camera z-far distance (always positive; frustum ends at z = -zfar)
    
    // g_modelMatrix.lookAt(5.0, 5.0, 3.0, -1.0, -2.0, -0.5, 0, 0, 1);
	g_modelMatrix.lookAt(eyex, eyey, eyez, aimx, aimy, aimz, 0, 0, 1);

	// gl.viewport(0,  														// Viewport lower-left corner
	// 			0,															// (x,y) location(in pixels)
	// 			gl.drawingBufferWidth/2, 				// viewport width, height.
	// 			gl.drawingBufferHeight);
	gl.viewport(0,  														// Viewport lower-left corner
				0,															// (x,y) location(in pixels)
				g_canvas.width/2, 				// viewport width, height.
				g_canvas.height);
    /*
     modelMatrix.lookAt( ??, ??, ??,	// center of projection
                      ??, ??, ??,	// look-at point 
                      ??, ??, ??);	// View UP vector.
    */
   drawScene();

   g_modelMatrix = popMatrix();

   // g_modelMatrix.ortho(-3.0, 3.0, 					// left,right;
  	// 					-3.0, 3.0, 					// bottom, top;
  	// 					0.0, 2000.0);  //near, far apparently 
	g_modelMatrix.ortho(-1*lr, lr, 					// left,right;
						-1*tb, tb, 					// bottom, top;
						znear, zfar);  //near, far apparently 
    
    // g_modelMatrix.lookAt(5.0, 5.0, 3.0, -1.0, -2.0, -0.5, 0, 0, 1);
	// g_modelMatrix.lookAt(5.0, 5.0, 2.0, 0.0, 0.0, 0.5, 0, 0, 1);
	g_modelMatrix.lookAt(eyex, eyey, eyez, aimx, aimy, aimz, 0, 0, 1);

	// gl.viewport(gl.drawingBufferWidth/2,  														// Viewport lower-left corner
	// 			0,															// (x,y) location(in pixels)
	// 			gl.drawingBufferWidth/2, 				// viewport width, height.
	// 			gl.drawingBufferHeight);
	gl.viewport(g_canvas.width/2,  														// Viewport lower-left corner
				0,															// (x,y) location(in pixels)
				g_canvas.width/2, 				// viewport width, height.
				g_canvas.height);
    /*
     modelMatrix.lookAt( ??, ??, ??,	// center of projection
                      ??, ??, ??,	// look-at point 
                      ??, ??, ??);	// View UP vector.
    */
   drawScene();
	
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate() {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  if(elapsed > 1000.0) {            
    // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
    // (user chose a different browser tab, etc.); when users make the browser
    // window visible again our resulting 'elapsedMS' value has gotten HUGE.
    // Instead of allowing a HUGE change in all our time-dependent parameters,
    // let's pretend that only a nominal 1/30th second passed:
    elapsed = 1000.0/30.0;
  }
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +120 and -85 degrees:
//  if(angle >  120.0 && g_angle01Rate > 0) g_angle01Rate = -g_angle01Rate;
//  if(angle <  -85.0 && g_angle01Rate < 0) g_angle01Rate = -g_angle01Rate;
  
  //wheel stuff
  wheelAngle  = wheelAngle + (angleStep * elapsed) / 1000.0;
  wheelAngle = wheelAngle %= 360;
  rAngle = rAngle + (rAngleStep * elapsed) / 1000.0;
  rAngle = rAngle %= 360;

  leanAngle += (lAnglerate * elapsed) / 1000.0;
  if((leanAngle >= lAnglemax && lAnglerate > 0) || // going over max, or
  	 (leanAngle <= lAnglemin && lAnglerate < 0)  ) // going under min ?
  	 lAnglerate *= -1;	// YES: reverse direction.
  
  seatAngle  = seatAngle + (seatRate * elapsed) / 1000.0;
//   seatAngle = seatAngle %= 360;
  if((seatAngle >= sangleMax && seatRate > 0) || // going over max, or
	(seatAngle <= sangleMin && seatRate < 0)  ) // going under min ?
	seatRate *= -1;

  upos = upos + (uspeed * elapsed) / 1000.0;
  if((upos >= rlim && uspeed > 0) || // going over max, or
  	 (upos <= llim && uspeed < 0)  ) // going under min ?
  	 uspeed *= -1;	// YES: reverse direction.

  bAngle1 = bAngle1 + (bRate * elapsed) / 1000.0;
  if((bAngle1 >= bMax && bRate > 0) || // going over max, or
  	 (bAngle1 <= bMin && bRate < 0)  ) // going under min ?
  	 bRate *= -1;	// YES: reverse direction.
  

  g_angle01 = g_angle01 + (g_angle01Rate * elapsed) / 1000.0;
  if(g_angle01 > 180.0) g_angle01 = g_angle01 - 360.0;
  if(g_angle01 <-180.0) g_angle01 = g_angle01 + 360.0;


  g_angle02 = g_angle02 + (g_angle02Rate * elapsed) / 1000.0;
  if(g_angle02 > 180.0) g_angle02 = g_angle02 - 360.0;
  if(g_angle02 <-180.0) g_angle02 = g_angle02 + 360.0;
  
  if(g_angle02 > 45.0 && g_angle02Rate > 0) g_angle02Rate *= -1.0;
  if(g_angle02 < 0.0  && g_angle02Rate < 0) g_angle02Rate *= -1.0;

  g_angle03 = g_angle03 + (g_angle03Rate * elapsed) / 1000.0;
  if(g_angle03 > 180.0) g_angle03 = g_angle03 - 360.0;
  if(g_angle03 <-180.0) g_angle03 = g_angle03 + 360.0;

  g_angle0now += g_angle0rate * g_angle0brake * (elapsed * 0.001);	// update.
  g_angle1now += g_angle1rate * g_angle1brake * (elapsed * 0.001);
  g_angle2now += g_angle2rate * g_angle2brake * (elapsed * 0.001);
  // apply angle limits:  going above max, or below min? reverse direction!
  // (!CAUTION! if max < min, then these limits do nothing...)
  if((g_angle0now >= g_angle0max && g_angle0rate > 0) || // going over max, or
  	 (g_angle0now <= g_angle0min && g_angle0rate < 0)  ) // going under min ?
  	 g_angle0rate *= -1;	// YES: reverse direction.
  if((g_angle1now >= g_angle1max && g_angle1rate > 0) || // going over max, or
  	 (g_angle1now <= g_angle1min && g_angle1rate < 0) )	 // going under min ?
  	 g_angle1rate *= -1;	// YES: reverse direction.
  if((g_angle2now >= g_angle2max && g_angle2rate > 0) || // going over max, or
  	 (g_angle2now <= g_angle2min && g_angle2rate < 0) )	 // going under min ?
  	 g_angle2rate *= -1;	// YES: reverse direction.
  if((g_angle3now >= g_angle3max && g_angle3rate > 0) || // going over max, or
  	 (g_angle3now <= g_angle3min && g_angle3rate < 0) )	 // going under min ?
  	 g_angle3rate *= -1;	// YES: reverse direction.
	// *NO* limits? Don't let angles go to infinity! cycle within -180 to +180.
	if(g_angle0min > g_angle0max)	
	{// if min and max don't limit the angle, then
		if(     g_angle0now < -180.0) g_angle0now += 360.0;	// go to >= -180.0 or
		else if(g_angle0now >  180.0) g_angle0now -= 360.0;	// go to <= +180.0
	}
	if(g_angle1min > g_angle1max)
	{
		if(     g_angle1now < -180.0) g_angle1now += 360.0;	// go to >= -180.0 or
		else if(g_angle1now >  180.0) g_angle1now -= 360.0;	// go to <= +180.0
	}
	if(g_angle2min > g_angle2max)
	{
		if(     g_angle2now < -180.0) g_angle2now += 360.0;	// go to >= -180.0 or
		else if(g_angle2now >  180.0) g_angle2now -= 360.0;	// go to <= +180.0
	}
	if(g_angle3min > g_angle3max)
	{
		if(     g_angle3now < -180.0) g_angle3now += 360.0;	// go to >= -180.0 or
		else if(g_angle3now >  180.0) g_angle3now -= 360.0;	// go to <= +180.0
	}

	//camera stuff
	aimx = eyex + Math.cos(theta) * dist1;
	// var aimy = eyey + Math.sin(theta) - 5.0;
	aimy = eyey + Math.sin(theta) * dist1;
	// var aimz = eyez + tilt - 1.0;
	aimz = eyez + tilt;
}

//==================HTML Button Callbacks======================

function angleSubmit() {
// Called when user presses 'Submit' button on our webpage
//		HOW? Look in HTML file (e.g. ControlMulti.html) to find
//	the HTML 'input' element with id='usrAngle'.  Within that
//	element you'll find a 'button' element that calls this fcn.

// Read HTML edit-box contents:
	var UsrTxt = document.getElementById('usrAngle').value;	
// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='editBoxOut':
  document.getElementById('EditBoxOut').innerHTML ='You Typed: '+UsrTxt;
  console.log('angleSubmit: UsrTxt:', UsrTxt); // print in console, and
  g_angle01 = parseFloat(UsrTxt);     // convert string to float number 
};

function clearDrag() {
// Called when user presses 'Clear' button in our webpage
	g_xMdragTot = 0.0;
	g_yMdragTot = 0.0;
}

function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.
  g_angle01Rate += 25; 
}

function spinDown() {
// Called when user presses the 'Spin <<' button
 g_angle01Rate -= 25; 
}

function runStop() {
// Called when user presses the 'Run/Stop' button
  if(g_angle01Rate*g_angle01Rate > 1) {  // if nonzero rate,
    myTmp = g_angle01Rate;  // store the current rate,
    g_angle01Rate = 0;      // and set to zero.
  }
  else {    // but if rate is zero,
  	g_angle01Rate = myTmp;  // use the stored rate.
  }
  if(g_angle02Rate*g_angle02Rate > 1) {  // if nonzero rate,
    myTmp = g_angle02Rate;  // store the current rate,
    g_angle02Rate = 0;      // and set to zero.
  }
  else {    // but if rate is zero,
  	g_angle02Rate = myTmp;  // use the stored rate.
  }
}

//===================Mouse and Keyboard event-handling Callbacks

function myMouseDown(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	g_isDrag = true;											// set our mouse-dragging flag
	g_xMclik = x;													// record where mouse-dragging began
	g_yMclik = y;
	// report on webpage
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Mouse At: '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);
};


function myMouseMove(ev) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(g_isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);		// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//									-1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	g_xMdragTot += (x - g_xMclik);			// Accumulate change-in-mouse-position,&
	g_yMdragTot += (y - g_yMclik);

	dragQuat(x - g_xMclik, y - g_yMclik);
	// Report new mouse position & how far we moved on webpage:
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Mouse At: '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);
	// document.getElementById('MouseDragResult').innerHTML = 
	//   'Mouse Drag: '+(x - g_xMclik).toFixed(g_digits)+', ' 
	//   					  +(y - g_yMclik).toFixed(g_digits);

	g_xMclik = x;											// Make next drag-measurement from here.
	g_yMclik = y;
};

function dragQuat(xdrag, ydrag) {
	//==============================================================================
	// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
	// We find a rotation axis perpendicular to the drag direction, and convert the 
	// drag distance to an angular rotation amount, and use both to set the value of 
	// the quaternion qNew.  We then combine this new rotation with the current 
	// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
	// 'draw()' function converts this current 'qTot' quaternion to a rotation 
	// matrix for drawing. 
		var res = 5;
		var qTmp = new Quaternion(0,0,0,1);
		
		var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
		// console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
		qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
		// (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
								// why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
								// -- to rotate around +x axis, drag mouse in -y direction.
								// -- to rotate around +y axis, drag mouse in +x direction.
								
		qTmp.multiply(qNew,qTot);			// apply new rotation to current rotation. 
		//--------------------------
		// IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
		// ANSWER: Because 'duality' governs ALL transformations, not just matrices. 
		// If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
		// first by qTot, and then by qNew--we would apply mouse-dragging rotations
		// to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
		// rotations FIRST, before we apply rotations from all the previous dragging.
		//------------------------
		// IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store 
		// them with finite precision. While the product of two (EXACTLY) unit-length
		// quaternions will always be another unit-length quaternion, the qTmp length
		// may drift away from 1.0 if we repeat this quaternion multiply many times.
		// A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
		// Matrix4.prototype.setFromQuat().
	//	qTmp.normalize();						// normalize to ensure we stay at length==1.0.
		qTot.copy(qTmp);
		// show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
		// document.getElementById('QuatValue').innerHTML= 
		// 													 '\t X=' +qTot.x.toFixed(res)+
		// 													'i\t Y=' +qTot.y.toFixed(res)+
		// 													'j\t Z=' +qTot.z.toFixed(res)+
		// 													'k\t W=' +qTot.w.toFixed(res)+
		// 													'<br>length='+qTot.length().toFixed(res);
};

function myMouseUp(ev) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords):\n\t xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):\n\t x, y=\t',x,',\t',y);
	
	g_isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	g_xMdragTot += (x - g_xMclik);
	g_yMdragTot += (y - g_yMclik);

	dragQuat(x - g_xMclik, y - g_yMclik);
	// Report new mouse position:
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Mouse At: '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);
	console.log('myMouseUp: g_xMdragTot,g_yMdragTot =',
		g_xMdragTot.toFixed(g_digits),',\t',g_yMdragTot.toFixed(g_digits));
};

function myMouseClick(ev) {
//=============================================================================
// Called when user completes a mouse-button single-click event 
// (e.g. mouse-button pressed down, then released)
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouseClick() on button: ", ev.button); 
}	

function myMouseDblClick(ev) {
//=============================================================================
// Called when user completes a mouse-button double-click event 
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouse-DOUBLE-Click() on button: ", ev.button); 
}	

function myKeyDown(kev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard;
//
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of a mess of JavaScript keyboard event handling,
// see:    http://javascript.info/tutorial/keyboard-events
//
// NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
//        'keydown' event deprecated several read-only properties I used
//        previously, including kev.charCode, kev.keyCode. 
//        Revised 2/2019:  use kev.key and kev.code instead.
//
// Report EVERYTHING in console:
  console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
              "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
              "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);

// and report EVERYTHING on webpage:
// 	document.getElementById('KeyDownResult').innerHTML = ''; // clear old results
//   document.getElementById('KeyModResult' ).innerHTML = ''; 
  // key details:
//   document.getElementById('KeyModResult' ).innerHTML = 
//         "   --kev.code:"+kev.code   +"      --kev.key:"+kev.key+
//     "<br>--kev.ctrlKey:"+kev.ctrlKey+" --kev.shiftKey:"+kev.shiftKey+
//     "<br>--kev.altKey:"+kev.altKey +"  --kev.metaKey:"+kev.metaKey;
 
	switch(kev.code) {
		case "KeyP":
			console.log("Pause/unPause!\n");                // print on console,
			// document.getElementById('KeyDownResult').innerHTML =  
			// 'myKeyDown() found p/P key. Pause/unPause!';   // print on webpage
			if(g_isRun==true) {
			  g_isRun = false;    // STOP animation
			  }
			else {
			  g_isRun = true;     // RESTART animation
			  tick();
			  }
			break;
		//------------------WASD navigation-----------------
		case "KeyA":
			console.log("a/A key: Strafe LEFT!\n");
			eyex -= 0.1 * Math.sin(theta);
			eyey += 0.1 * Math.cos(theta);
			//eyex -= 0.1;
			// document.getElementById('KeyDownResult').innerHTML =  
			// 'myKeyDown() found a/A key. Strafe LEFT!';
			break;
    case "KeyD":
			console.log("d/D key: Strafe RIGHT!\n");
			eyex += 0.1 * Math.sin(theta);
			eyey -= 0.1 * Math.cos(theta);
			//eyex += 0.1;
			// document.getElementById('KeyDownResult').innerHTML = 
			// 'myKeyDown() found d/D key. Strafe RIGHT!';
			break;
		case "KeyS":
			console.log("s/S key: Move BACK!\n");
			eyex -= 0.1 * Math.cos(theta);
			eyey -= 0.1 * Math.sin(theta);
			eyez -= 0.1 * tilt;
			// document.getElementById('KeyDownResult').innerHTML = 
			// 'myKeyDown() found s/Sa key. Move BACK.';
			break;
		case "KeyW":
			console.log("w/W key: Move FWD!\n");
			eyex += 0.1 * Math.cos(theta);
			eyey += 0.1 * Math.sin(theta);
			eyez += 0.1 * tilt;
			// document.getElementById('KeyDownResult').innerHTML =  
			// 'myKeyDown() found w/W key. Move FWD!';
			break;
		//----------------Arrow keys------------------------
		//used for theta and tilt
		case "ArrowLeft":
			theta += 0.01;	
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		// document.getElementById('KeyDownResult').innerHTML =
  		// 	'myKeyDown(): Left Arrow='+kev.keyCode;
			break;
		case "ArrowRight":
			theta -= 0.01;
			console.log('right-arrow.');
  		// document.getElementById('KeyDownResult').innerHTML =
  		// 	'myKeyDown():Right Arrow:keyCode='+kev.keyCode;
  			break;
		case "ArrowUp":		
			tilt += 0.01;
			console.log('   up-arrow.');
			break;
		case "ArrowDown":
			tilt -= 0.01;
			console.log(' down-arrow.');
  			break;	
    default:
      console.log("UNUSED!");
  		document.getElementById('KeyDownResult').innerHTML =
  			'myKeyDown(): UNUSED!';
      break;
	}
}

function myKeyUp(kev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

	console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
}

//Drawing function(s)
function drawScene(){
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
  // Draw the cylinder's vertices, and no other vertices:
    gl.drawArrays(gl.LINES,				// use this drawing primitive, and
  							aStart/floatsPerVertex, // start at this vertex number, and
  							aVerts.length/floatsPerVertex);	// draw this many vertices.
	pushMatrix(g_modelMatrix);
    // g_modelMatrix.setIdentity();  // 'set' means DISCARD old matrix,
	// DEBUGGING: if your push/pop operations are all balanced and correct,
	// you can comment out this 'setIdentity()' call with no on-screen change...

	// Move drawing axes to the 'base' or 'shoulder' of the robot arm:
	g_modelMatrix.scale(1, 1, -1);
	g_modelMatrix.scale(0.2, 0.2, 0.2);
	// g_modelMatrix.translate(upos+20,20.5, -10.0);
    //original translate
    g_modelMatrix.translate(upos,-3.5, -2.0);  
	// 	  						// (drawing axes centered in CVV), and then make new
	// 	  						// drawing axes moved to the lower-left corner of CVV.  
	// drawRobot();
	g_modelMatrix.rotate(90.0, 0, 0, 1);

	g_modelMatrix.rotate(rAngle, 0, 0, 1);
	drawWheel();
    g_modelMatrix = popMatrix();

	//testing out prism
    pushMatrix(g_modelMatrix);
	// g_modelMatrix.setIdentity();
	// g_modelMatrix.scale(1, 1, -1);
	// g_modelMatrix.scale(1.0, 1.0, 1.0);
	g_modelMatrix.scale(0.2, 0.2, 0.2);
	g_modelMatrix.translate(1.8, 2.5, 3.0);
	g_modelMatrix.rotate(90.0, 0, 0, 1);
	g_modelMatrix.rotate(-90.0, 1, 0, 0);
	// g_modelMatrix.rotate(90.0, 0, 1, 0);
	// g_modelMatrix.rotate(rAngle, 1, 0, 0);
	// var dist = Math.sqrt(g_xMdragTot*g_xMdragTot + g_yMdragTot*g_yMdragTot);
	// 						// why add 0.001? avoids divide-by-zero in next statement
	// 						// in cases where user didn't drag the mouse.)
	// g_modelMatrix.rotate(dist*120.0, -g_yMdragTot+0.0001, g_xMdragTot+0.0001, 0.0);
	quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
	g_modelMatrix.concat(quatMatrix);	// apply that matrix.
	drawBird();
    g_modelMatrix = popMatrix();
	// gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
  	// 	// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
    // // console.log("heart")
	// // console.log(hStart)
	// // console.log(hVerts.length)
	// gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
    // 	pStart/floatsPerVertex, // start at this vertex number, and
    // 	pVerts.length/floatsPerVertex);	// draw this many vertices.

    pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
  	//---------Draw Ground Plane, without spinning.
  	// position it.
  	g_modelMatrix.translate( 0.4, -0.4, 0.0);	
  	g_modelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:

  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
    gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
    // Draw just the ground-plane's vertices
    gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
    						  gndStart/floatsPerVertex,	// start at this vertex number, and
    						  gndVerts.length/floatsPerVertex);	// draw this many vertices.
    g_modelMatrix = popMatrix();  // RESTORE 'world' drawing coords.
}

function makeAxes(){
	// Drawing Axes: Draw them using gl.LINES drawing primitive;
     	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
	aVerts = new Float32Array([
		 0.0,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// X axis line (origin: red)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// 						 (endpoint: red)
		 
		 0.0,  0.0,  0.0, 1.0,    0.3,  1.0,  0.3,	// Y axis line (origin: green)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  1.0,	// Z axis line (origin:blue)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,	//						 (endpoint: blue)
		]);
}


function makeGroundGrid() {
    //==============================================================================
    // Create a list of vertices that create a large grid of lines in the x,y plane
    // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.
    
    var xcount = 100;			// # of lines to draw in x,y to make the grid.
    var ycount = 100;		
    var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
        var xColr = new Float32Array([1.0, 1.0, 1.0]);	// bright white
		// var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
        var yColr = new Float32Array([1.0, 1.0, 1.0]);	// bright white.
		// var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
        
    // Create an (global) array to hold this ground-plane's vertices:
    gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
                        // draw a grid made of xcount+ycount lines; 2 vertices per line.
                        
    var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
    var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
    
    // First, step thru x values as we make vertical lines of constant-x:
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
        if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
            gndVerts[j  ] = -xymax + (v  )*xgap;	// x
            gndVerts[j+1] = -xymax;								// y
            gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;									// w.
        }
        else {				// put odd-numbered vertices at (xnow, +xymax, 0).
            gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
            gndVerts[j+1] = xymax;								// y
            gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;									// w.
        }
        gndVerts[j+4] = xColr[0];			// red
        gndVerts[j+5] = xColr[1];			// grn
        gndVerts[j+6] = xColr[2];			// blu
    }
    // Second, step thru y values as wqe make horizontal lines of constant-y:
    // (don't re-initialize j--we're adding more vertices to the array)
    for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
        if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
            gndVerts[j  ] = -xymax;								// x
            gndVerts[j+1] = -xymax + (v  )*ygap;	// y
            gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;									// w.
        }
        else {					// put odd-numbered vertices at (+xymax, ynow, 0).
            gndVerts[j  ] = xymax;								// x
            gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
            gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;									// w.
        }
        gndVerts[j+4] = yColr[0];			// red
        gndVerts[j+5] = yColr[1];			// grn
        gndVerts[j+6] = yColr[2];			// blu
    }
}
function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.74, 0.2, 0.64]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1.0;		// radius of bottom of cylinder (top always 1.0)
 
 // Create a (global) array to hold this cylinder's vertices;
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] = 1.0 * 0.2; 
			cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
			cylVerts[j+4]=ctrColr[0]; 
			cylVerts[j+5]=ctrColr[1]; 
			cylVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0 * 0.2;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = 1.0 * 0.2;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=topColr[0]; 
				cylVerts[j+5]=topColr[1]; 
				cylVerts[j+6]=topColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] =-1.0 * 0.2;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=botColr[0]; 
				cylVerts[j+5]=botColr[1]; 
				cylVerts[j+6]=botColr[2];			
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0 * 0.2;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] =-1.0 * 0.2; 
			cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];
		}
	}
}

function makeAxle() {
//  var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var ctrColr = new Float32Array([0.0, 0.0, 0.0]);	// dark gray
//  var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
 var topColr = new Float32Array([1.0, 0.0, 0.0]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 0.2;		// radius of bottom of cylinder (top always 1.0)
 var topRadius = 0.2;
 var zLen = 2;
 
 // Create a (global) array to hold this cylinder's vertices;
 axVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			axVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			axVerts[j+1] = 0.0;	
			axVerts[j+2] = 1.0 * zLen; 
			axVerts[j+3] = 1.0;			// r,g,b = topColr[]
			axVerts[j+4]=ctrColr[0]; 
			axVerts[j+5]=ctrColr[1]; 
			axVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			axVerts[j  ] = topRadius * Math.cos(Math.PI*(v-1)/capVerts);			// x
			axVerts[j+1] = topRadius * Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			axVerts[j+2] = 1.0 * zLen;	// z
			axVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			axVerts[j+4]=topColr[0]; 
			axVerts[j+5]=topColr[1]; 
			axVerts[j+6]=topColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				axVerts[j  ] = topRadius * Math.cos(Math.PI*(v)/capVerts);		// x
				axVerts[j+1] = topRadius * Math.sin(Math.PI*(v)/capVerts);		// y
				axVerts[j+2] = 1.0 * zLen;	// z
				axVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				axVerts[j+4]=topColr[0]; 
				axVerts[j+5]=topColr[1]; 
				axVerts[j+6]=topColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				axVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				axVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				axVerts[j+2] =-1.0 * zLen;	// z
				axVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				axVerts[j+4]=botColr[0]; 
				axVerts[j+5]=botColr[1]; 
				axVerts[j+6]=botColr[2];			
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			axVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			axVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			axVerts[j+2] =-1.0 * zLen;	// z
			axVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			axVerts[j+4]=botColr[0]; 
			axVerts[j+5]=botColr[1]; 
			axVerts[j+6]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			axVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			axVerts[j+1] = 0.0;	
			axVerts[j+2] =-1.0 * zLen; 
			axVerts[j+3] = 1.0;			// r,g,b = botColr[]
			axVerts[j+4]=botColr[0]; 
			axVerts[j+5]=botColr[1]; 
			axVerts[j+6]=botColr[2];
		}
	}
}


function drawWheel() {
	//TODO for this:
	//make axle part of initvbo
	//then, put wheel cylinder drawing function here; probably copy from testing2 because in this
	//file the wheel follows the mouse
	//then, put it together with axle using push/pop
	//MAYBE make the translate thing part of where the mouse is??? the unicycle can either be moving 
	//continuously back and forth along the bottom of the screen or it can follow mouse drag
	//or it can move by l/r key presses
	//either way, it should have parameters, like: how far can it go, how far can the axle lean
	//if it's moving on its own the wheel should change rotation direction when it reaches riding limit
	//can it ride along other axes besides horizontal? if so, how far?
	pushMatrix(g_modelMatrix);
	//Draw wheel
	// console.log("hello");
	// g_modelMatrix.translate(0.0,0.0, 0.0);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV. 
    // g_modelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
    // g_modelMatrix.scale(0.2, 0.2, 0.2);
  						// if you DON'T scale, cyl goes outside the CVV; clipped!
    g_modelMatrix.rotate(90, -1, 0, 0);
	g_modelMatrix.rotate(wheelAngle, 0, 0, 1);  // spin around z axis.
	// Drawing:
  // Pass our current matrix to the vertex shaders:
    gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
  // Draw the cylinder's vertices, and no other vertices:
    gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cylStart/floatsPerVertex, // start at this vertex number, and
  							cylVerts.length/floatsPerVertex);	// draw this many vertices.
	// popMatrix(g_modelMatrix);
	g_modelMatrix = popMatrix();
	// pushMatrix(g_modelMatrix);
	//draw axle
	// g_modelMatrix.setTranslate(0.4,-0.3, -0.1);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV. 
    // g_modelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  	// g_modelMatrix.scale(0.2, 0.2, 0.2);
  						// if you DON'T scale, cyl goes outside the CVV; clipped!
	// g_modelMatrix.rotate(90, 1, 0, 0);
	g_modelMatrix.translate(0.0, 0.5, 0.0);
	g_modelMatrix.rotate(leanAngle, 0, 1, 0);  // spin around y axis.
	g_modelMatrix.translate(0.0, 0.0, -1.7);
	
	// Drawing:
  // Pass our current matrix to the vertex shaders:
 	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
  // Draw the cylinder's vertices, and no other vertices:
  	// updateModelMatrix(g_modelMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							axStart/floatsPerVertex, // start at this vertex number, and
  							axVerts.length/floatsPerVertex);	// draw this many vertices.

	g_modelMatrix.scale(1, 1, -1);
	// g_modelMatrix.scale(1.0, 1.0, 1.0);
	g_modelMatrix.scale(1.3, 1.3, 1.3);
	g_modelMatrix.translate(0.3, 0.3, 2.1);
	// g_modelMatrix.rotate(90.0, -1, 0, 0);
	g_modelMatrix.rotate(90.0, 0, 0, 1);
	g_modelMatrix.rotate(seatAngle, 0, 1, 0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
	// console.log("heart")
	// console.log(hStart)
	// console.log(hVerts.length)
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
		hStart/floatsPerVertex, // start at this vertex number, and
		hVerts.length/floatsPerVertex);	// draw this many vertices.
 
	// popMatrix(g_modelMatrix);
}


function makePrism(){
	//build a triangular prism from individual triangles
	//should have 5 faces total; 6 main nodes
	//"rectangle" faces can be composed of, say, a couple triangles each, which brings total to
	//8 "faces"?
	//do them all in red first

	pVerts = new Float32Array([
		// 4.5973, -4.8484, -0.0000, 1.0, 0.0, 0.0,
		// 0.0000, -4.8484, 7.9628, 0.0, 1.0, 0.0,
		// -4.5973, -4.8484, -0.0000, 0.0, 0.0, 1.0,
		// -0.0000, 4.8484, 7.9628, 1.0, 0.0, 0.0,
		// -4.5973, 4.8484, -0.0000, 0.0, 1.0, 0.0,
		// 4.5973, 4.8484, -0.0000, 0.0, 0.0, 1.0,
		//Triangle face 1
		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //NODE 0
		1.0, 1.0, 0.0, 1.0, 0.9, 0.17, 0.31, //NODE 1
		-1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,//NODE 2

		//rectangle face 1
		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //NODE 0
		0.0, 0.0, 2.0, 1.0, 0.87, 0.36, 0.51, //NODE 3
		1.0, 1.0, 2.0, 1.0, 0.9, 0.17, 0.31, //NODE 4

		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //NODE 0
		1.0, 1.0, 0.0, 1.0, 0.9, 0.17, 0.31, //NODE 1
		1.0, 1.0, 2.0, 1.0, 0.9, 0.17, 0.31, //NODE 4

		//rectangle face 2
		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //NODE 0
		0.0, 0.0, 2.0, 1.0, 0.87, 0.36, 0.51, //NODE 3
		-1.0, 1.0, 2.0, 1.0, 0.0, 0.0, 1.0,//NODE 5

		-1.0, 1.0, 2.0, 1.0, 0.0, 0.0, 1.0,//NODE 5
		-1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,//NODE 2
		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //NODE 0

		//rectangle face 3
		1.0, 1.0, 0.0, 1.0, 0.9, 0.17, 0.31, //NODE 1
		-1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,//NODE 2
		-1.0, 1.0, 2.0, 1.0, 0.0, 0.0, 1.0,//NODE 5

		-1.0, 1.0, 2.0, 1.0, 0.0, 0.0, 1.0,//NODE 5
		1.0, 1.0, 0.0, 1.0, 0.9, 0.17, 0.31, //NODE 1
		1.0, 1.0, 2.0, 1.0, 0.9, 0.17, 0.31, //NODE 4

		//Triangle face 2
		0.0, 0.0, 2.0, 1.0, 0.87, 0.36, 0.51, //NODE 3
		1.0, 1.0, 2.0, 1.0, 0.9, 0.17, 0.31, //NODE 4
		-1.0, 1.0, 2.0, 1.0, 0.0, 0.0, 1.0,//NODE 5
	]);
}

function makeWing(){
	wVerts = new Float32Array([
		//Nodes:
		//0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,   0
		//1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,   1
		//0.0, -2.0, 0.5, 1.0, 0.0, 0.0, 1.0,  2
		//0.0, -2.0, -0.5, 1.0, 1.0, 0.0, 0.0,   3
		//1.0, -2.0, -0.5, 1.0, 0.0, 1.0, 0.0,  4
		//1.0, -2.0, 0.5, 1.0, 0.0, 0.0, 1.0,   5

		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //node 0
		0.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 2
		0.0, -2.0, -0.2, 1.0, 0.87, 0.36, 0.51, //node 3

		0.0, -2.0, -0.2, 1.0, 0.87, 0.36, 0.51, //node 3
		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //node 0
		1.0, 0.0, 0.0, 1.0, 0.9, 0.17, 0.31, //node 1

		1.0, 0.0, 0.0, 1.0, 0.9, 0.17, 0.31, //node 1
		0.0, -2.0, -0.2, 1.0, 0.87, 0.36, 0.51, //node 3
		1.0, -2.0, -0.2, 1.0, 0.9, 0.17, 0.31, //node 4

		1.0, -2.0, -0.2, 1.0, 0.9, 0.17, 0.31, //node 4
		1.0, 0.0, 0.0, 1.0, 0.9, 0.17, 0.31, //node 1
		1.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 5

		1.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 5
		0.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 2
		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //node 0

		0.0, 0.0, 0.0, 1.0, 0.87, 0.36, 0.51, //node 0
		1.0, 0.0, 0.0, 1.0, 0.9, 0.17, 0.31, //node 1
		1.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 5

		1.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 5
		0.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 2
		0.0, -2.0, -0.2, 1.0, 0.87, 0.36, 0.51, //node 3

		0.0, -2.0, -0.2, 1.0, 0.87, 0.36, 0.51, //node 3
		1.0, -2.0, -0.2, 1.0, 0.9, 0.17, 0.31, //node 4
		1.0, -2.0, 0.2, 1.0, 0.0, 0.0, 1.0, //node 5
	]);
}

function drawBird(){
	pushMatrix(g_modelMatrix);
	// g_modelMatrix.scale(0.9, 0.9, 0.9);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
    	pStart/floatsPerVertex, // start at this vertex number, and
    	pVerts.length/floatsPerVertex);
	
	g_modelMatrix = popMatrix();
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1, 1, -1);
	g_modelMatrix.scale(1.0, 1.0, 1.0);
	g_modelMatrix.translate(-0.38, 0.25, -0.5)
	g_modelMatrix.rotate(90.0, 0, 0, 1);
	g_modelMatrix.rotate(90.0, 0, 1, 0);
	// g_modelMatrix.rotate(-38.0, 1, 0, 0);
	g_modelMatrix.rotate(bAngle1, 1, 0, 0);
	g_modelMatrix.translate(0.0, 2.0, 0.0);
	// g_modelMatrix.rotate(rAngle, 1, 1, 1);;
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
    	wStart/floatsPerVertex, // start at this vertex number, and
    	wVerts.length/floatsPerVertex);	// draw this many vertices.
	
	g_modelMatrix = popMatrix();
	g_modelMatrix.scale(1, 1, -1);
	g_modelMatrix.scale(1.0, 1.0, 1.0);
	g_modelMatrix.translate(0.38, 0.25, -1.5)
	g_modelMatrix.rotate(-90.0, 0, 0, 1);
	g_modelMatrix.rotate(-90.0, 0, 1, 0);
	// g_modelMatrix.rotate(-38.0, 1, 0, 0);
	g_modelMatrix.rotate(bAngle1, 1, 0, 0);
	g_modelMatrix.translate(0.0, 2.0, 0.0);
	// g_modelMatrix.rotate(rAngle, 1, 1, 1);;
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
    	wStart/floatsPerVertex, // start at this vertex number, and
    	wVerts.length/floatsPerVertex);	// draw this many vertices.
}

//robot stuff, see if it works
function drawBox() {
	//==============================================================================
	// Draw our 2 red triangles using current g_modelMatrix:
			  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
			  gl.drawArrays(gl.TRIANGLES, rStart/floatsPerVertex, rVerts.length/floatsPerVertex);	// draw all vertices.
}

function drawRobot() {
	//==============================================================================
		//----------------------------------------------------------
		pushMatrix(g_modelMatrix);		// SAVE current drawing axes.
		//----------------------------------------------------------		
				//-------Draw Lower Arm---------------
			  g_modelMatrix.rotate(g_angle0now, 0, 0, 1);  // Make new drawing axes that
									  // that spin around z axis (0,0,1) of the previous 
									  // drawing axes, using the same origin.
			
			  //g_modelMatrix.rotate(3*g_angle0now, 0,1,0);  //  try: SPIN ON Y AXIS!!!
				g_modelMatrix.translate(-0.1, 0,0);						// Move box so that we pivot
										// around the MIDDLE of it's lower edge, and not the left corner.
			
			  // DRAW BOX:  Use this matrix to transform & draw our VBO's contents:
			  drawBox();
			
			  //-------Draw Upper Arm----------------
			  g_modelMatrix.translate(0.1, 0.5, 0); 			// Make new drawing axes that
									  // we moved upwards (+y) measured in prev. drawing axes, and
									  // moved rightwards (+x) by half the width of the box we just drew.
			  g_modelMatrix.scale(0.6,0.6,0.6);				// Make new drawing axes that
									  // are smaller that the previous drawing axes by 0.6.
			  g_modelMatrix.rotate(g_angle1now, 0,0,1);	// Make new drawing axes that
									  // spin around Z axis (0,0,1) of the previous drawing 
									  // axes, using the same origin.
			  g_modelMatrix.translate(-0.1, 0, 0);			// Make new drawing axes that
									  // move sideways by half the width of our rectangle model
									  // (REMEMBER! g_modelMatrix.scale() DIDN'T change the 
									  // the vertices of our model stored in our VBO; instead
									  // we changed the DRAWING AXES used to draw it. Thus
									  // we translate by the 0.1, not 0.1*0.6.)
			
			  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
			  drawBox();
			  
			  // DRAW PINCERS:====================================================
				g_modelMatrix.translate(0.1, 0.5, 0.0);	// Make new drawing axes at 
									  // the robot's "wrist" -- at the center top of upper arm
				
				// SAVE CURRENT DRAWING AXES HERE--------------------------
				//  copy current matrix so that we can return to these same drawing axes
				// later, when we draw the UPPER jaw of the robot pincer.  HOW?
				// Try a 'push-down stack'.  We want to 'push' our current g_modelMatrix
				// onto the stack to save it; then later 'pop' when we're ready to draw
				// the upper pincer.
				//----------------------------------------------------------
				pushMatrix(g_modelMatrix);
						//-----------------------------------------------------------
						// CAUTION!  Instead of our textbook's matrix library 
						//  (WebGL Programming Guide:  
						//
						//				lib/cuon-matrix.js
						//
						// be sure your HTML file loads this MODIFIED matrix library:
						//
						//				cuon-matrix-quat03.js
						// where Adrien Katsuya Tateno (former diligent classmate in EECS351)
						// has added push-down matrix-stack functions 'push' and 'pop'.
						//--------------------------------------------------------------
						//=========Draw lower jaw of robot pincer============================
						g_modelMatrix.rotate(g_angle2now, 0,0,1);		
											// make new drawing axes that rotate for lower-jaw
						g_modelMatrix.scale(0.4, 0.4, 0.4);		// Make new drawing axes that
											// have size of just 40% of previous drawing axes,
											// (Then translate? no need--we already have the box's 
											//	left corner at the wrist-point; no change needed.)
					
						// Draw inner lower jaw segment:				
					  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
					  drawBox();
						// Now move drawing axes to the centered end of that lower-jaw segment:
						g_modelMatrix.translate(0.1, 0.5, 0.0);
						g_modelMatrix.rotate(40.0, 0,0,1);		// make bend in the lower jaw
						g_modelMatrix.translate(-0.1, 0.0, 0.0);	// re-center the outer segment,
						// Draw outer lower jaw segment:				
					  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
					  drawBox();
					  
					  // RETURN to the saved drawing axes at the 'wrist':
						// RETRIEVE PREVIOUSLY-SAVED DRAWING AXES HERE:
						//-----------------------
				g_modelMatrix = popMatrix();
				//---------------------------	
				//=========Draw upper jaw of robot pincer============================
				// (almost identical to the way I drew the upper jaw)
				g_modelMatrix.rotate(-g_angle2now, 0,0,1);		
									// make new drawing axes that rotate upper jaw symmetrically
									// with lower jaw: changed sign of 15.0 and of 0.5
				g_modelMatrix.scale(0.4, 0.4, 0.4);		// Make new drawing axes that
									// have size of just 40% of previous drawing axes,
				g_modelMatrix.translate(-0.2, 0, 0);  // move box LEFT corner at wrist-point.
				
				// Draw inner upper jaw segment:				(same as for lower jaw)
			  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
			  drawBox();
			
				// Now move drawing axes to the centered end of that upper-jaw segment:
				g_modelMatrix.translate(0.1, 0.5, 0.0);
				g_modelMatrix.rotate(-40.0, 0,0,1);		// make bend in the upper jaw that
																						// is opposite of lower jaw (+/-40.0)
				g_modelMatrix.translate(-0.1, 0.0, 0.0);	// re-center the outer segment,
				 
				// Draw outer upper jaw segment:		(same as for lower jaw)		
			  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
			  drawBox();
		//----------------------------------------------------------
		g_modelMatrix = popMatrix();	// RETURN to our initial drawing axes.
		//----------------------------------------------------------	
}

function makeHeart(){
	hVerts = new Float32Array([
		0.002305423115378513,0.9157965094553564,-0.04498191743996127,1.0,-0.225056689814027,0.4563525404750586,0.8608669149014341,
-0.27416172483475965,0.7429880156559439,-0.02565161944267713,1.0,-0.225056689814027,0.4563525404750586,0.8608669149014341,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,-0.225056689814027,0.4563525404750586,0.8608669149014341,
0.1996885704815865,0.1970021236334789,-0.49114877278223534,1.0,0.44822545374146744,-0.5415236022995253,-0.7112286065470097,
0.017382945377723003,-0.04324114395260248,-0.4231208873537764,1.0,0.44822545374146744,-0.5415236022995253,-0.7112286065470097,
-0.04174642916493376,0.06895060555229615,-0.5458068567745561,1.0,0.44822545374146744,-0.5415236022995253,-0.7112286065470097,
-0.5510879375231255,0.12613170934591533,0.028589633767333256,1.0,-0.14253619919147134,-0.40456553455754424,0.9033328069810249,
-0.3159531423440396,-0.07289488978314707,-0.023444436181279338,1.0,-0.14253619919147134,-0.40456553455754424,0.9033328069810249,
-0.26895225818535384,0.13075724564829572,0.07517919592056699,1.0,-0.14253619919147134,-0.40456553455754424,0.9033328069810249,
0.2181466454762382,0.10207671706279364,-0.1510221994526113,1.0,0.7052231438555001,-0.7078636702732277,0.03986654835673492,
0.0266321817235311,-0.09701047861171486,-0.2981671381261529,1.0,0.7052231438555001,-0.7078636702732277,0.03986654835673492,
0.3102644121079241,0.18594233596010157,-0.29144459409954915,1.0,0.7052231438555001,-0.7078636702732277,0.03986654835673492,
-0.3143629420908196,-0.23314704486256066,-0.34325647671485937,1.0,-0.4843652248315786,-0.7417943088297128,-0.4638227380818052,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.4843652248315786,-0.7417943088297128,-0.4638227380818052,
-0.302800019464345,-0.19376847161740451,-0.41830988889715215,1.0,-0.4843652248315786,-0.7417943088297128,-0.4638227380818052,
0.09095266032606442,0.6309248042777489,-0.6026959953946626,1.0,-0.05526578556008992,0.2605837257664046,-0.9638681521930919,
-0.2732289052866814,0.5560715443213231,-0.6020514685021912,1.0,-0.05526578556008992,0.2605837257664046,-0.9638681521930919,
0.024929969674183372,0.8323679201888408,-0.5444498614083555,1.0,-0.05526578556008992,0.2605837257664046,-0.9638681521930919,
0.20081236096076727,0.7214486981383088,-0.5651334822539344,1.0,0.25002919879822694,0.09633763043048098,-0.963433682570501,
0.1931000733585453,0.5120472359253043,-0.5880738653526398,1.0,0.25002919879822694,0.09633763043048098,-0.963433682570501,
0.09095266032606442,0.6309248042777489,-0.6026959953946626,1.0,0.25002919879822694,0.09633763043048098,-0.963433682570501,
0.3530529182286344,0.69739554211414,-0.0294288041088131,1.0,0.7508847887617732,0.0054405119111560945,0.6604108076313802,
0.37239974255649466,0.4454314336316334,-0.04935037748893423,1.0,0.7508847887617732,0.0054405119111560945,0.6604108076313802,
0.4610139271060283,0.6326270163270964,-0.15164652749660068,1.0,0.7508847887617732,0.0054405119111560945,0.6604108076313802,
-0.7752235415742799,0.9611906670302459,-0.22558165797657126,1.0,-0.5745167009218312,0.7154557945403448,0.3975595130550133,
-0.9431237151925639,0.7940690672079957,-0.16746038959906207,1.0,-0.5745167009218312,0.7154557945403448,0.3975595130550133,
-0.7149446689271015,0.9178586282594743,-0.060490960556239703,1.0,-0.5745167009218312,0.7154557945403448,0.3975595130550133,
-0.7336194224781968,0.46794213213535807,0.05858492376311886,1.0,-0.13653250717135762,0.004132850433743613,0.9906269701723225,
-0.4449723688934061,0.31038009642195763,0.099024854683057,1.0,-0.13653250717135762,0.004132850433743613,0.9906269701723225,
-0.6578608868579865,0.7030750910554908,0.06804532988851153,1.0,-0.13653250717135762,0.004132850433743613,0.9906269701723225,
-0.39180532717084826,0.028536382257698722,-0.5500265798483435,1.0,-0.3351570654882758,-0.41521404713251436,-0.8457346135266818,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.3351570654882758,-0.41521404713251436,-0.8457346135266818,
-0.5653336344798017,0.24375144031561624,-0.5869188584712594,1.0,-0.3351570654882758,-0.41521404713251436,-0.8457346135266818,
-0.3706938579892415,0.42227437197648476,-0.6273239004710922,1.0,0.03904150309960743,0.1579299425232242,-0.9866782121291289,
-0.6526973266824034,0.6827697395542114,-0.5967869140841979,1.0,0.03904150309960743,0.1579299425232242,-0.9866782121291289,
-0.2732289052866814,0.5560715443213231,-0.6020514685021912,1.0,0.03904150309960743,0.1579299425232242,-0.9866782121291289,
0.1931000733585453,0.5120472359253043,-0.5880738653526398,1.0,0.13692469788296488,-0.004187315077984571,-0.990572608899568,
0.008904937792137302,0.32020408182002646,-0.6127238055365044,1.0,0.13692469788296488,-0.004187315077984571,-0.990572608899568,
0.09095266032606442,0.6309248042777489,-0.6026959953946626,1.0,0.13692469788296488,-0.004187315077984571,-0.990572608899568,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,-0.03677945269295662,-0.05995756914065315,-0.9975231133975545,
-0.49997383330992107,0.33550746393357866,-0.6173419968030732,1.0,-0.03677945269295662,-0.05995756914065315,-0.9975231133975545,
-0.3706938579892415,0.42227437197648476,-0.6273239004710922,1.0,-0.03677945269295662,-0.05995756914065315,-0.9975231133975545,
-0.3706938579892415,0.42227437197648476,-0.6273239004710922,1.0,-0.08990542398986338,0.019401145442715113,-0.9957613219505533,
-0.49997383330992107,0.33550746393357866,-0.6173419968030732,1.0,-0.08990542398986338,0.019401145442715113,-0.9957613219505533,
-0.6526973266824034,0.6827697395542114,-0.5967869140841979,1.0,-0.08990542398986338,0.019401145442715113,-0.9957613219505533,
-0.8792861726946457,0.8801400331077489,-0.33021536563129217,1.0,-0.8443342506923475,0.5335714978255086,-0.04900132463551683,
-1.0,0.6896630556634356,-0.32430261180292175,1.0,-0.8443342506923475,0.5335714978255086,-0.04900132463551683,
-0.9431237151925639,0.7940690672079957,-0.16746038959906207,1.0,-0.8443342506923475,0.5335714978255086,-0.04900132463551683,
0.33510715948184444,0.5517636808177961,-0.5244034224194365,1.0,0.4952400775647093,0.18838186927867934,-0.8480858075105203,
0.20081236096076727,0.7214486981383088,-0.5651334822539344,1.0,0.4952400775647093,0.18838186927867934,-0.8480858075105203,
0.4296891856283356,0.6790788590588621,-0.44089220150003994,1.0,0.4952400775647093,0.18838186927867934,-0.8480858075105203,
-0.02559102289723103,0.9687817615415759,-0.13467398599485303,1.0,-0.48525031267677277,0.8701695909150985,0.0856563896842763,
-0.003012382812249026,0.9965478331685291,-0.288835270127464,1.0,-0.48525031267677277,0.8701695909150985,0.0856563896842763,
-0.26267408882535437,0.8375847318740584,-0.1449588723901022,1.0,-0.48525031267677277,0.8701695909150985,0.0856563896842763,
0.09095266032606442,0.6309248042777489,-0.6026959953946626,1.0,0.007621825607137777,0.10056885856195256,-0.9949009058504071,
-0.11353313666999953,0.41232184845171216,-0.6263598645208145,1.0,0.007621825607137777,0.10056885856195256,-0.9949009058504071,
-0.3706938579892415,0.42227437197648476,-0.6273239004710922,1.0,0.007621825607137777,0.10056885856195256,-0.9949009058504071,
0.09095266032606442,0.6309248042777489,-0.6026959953946626,1.0,-0.0465395774261502,0.2180339434014,-0.9748308916206084,
-0.3706938579892415,0.42227437197648476,-0.6273239004710922,1.0,-0.0465395774261502,0.2180339434014,-0.9748308916206084,
-0.2732289052866814,0.5560715443213231,-0.6020514685021912,1.0,-0.0465395774261502,0.2180339434014,-0.9748308916206084,
-0.302800019464345,-0.19376847161740451,-0.41830988889715215,1.0,0.1858430115073903,-0.881580285658514,-0.43391079153682816,
-0.14991126278610056,-0.20341066737913527,-0.3332378478677821,1.0,0.1858430115073903,-0.881580285658514,-0.43391079153682816,
-0.3143629420908196,-0.23314704486256066,-0.34325647671485937,1.0,0.1858430115073903,-0.881580285658514,-0.43391079153682816,
-0.19792943440469868,-0.20229973071262453,-0.1286473841114023,1.0,0.5361999931922076,-0.8197771785389295,0.20113414639843868,
0.0266321817235311,-0.09701047861171486,-0.2981671381261529,1.0,0.5361999931922076,-0.8197771785389295,0.20113414639843868,
0.013273397841110146,-0.062387816054595646,-0.12144006772123017,1.0,0.5361999931922076,-0.8197771785389295,0.20113414639843868,
0.0266321817235311,-0.09701047861171486,-0.2981671381261529,1.0,0.6998299673332175,-0.6978928627572585,-0.15226151494999027,
0.23412577088446151,0.1290862500011476,-0.38079511848919956,1.0,0.6998299673332175,-0.6978928627572585,-0.15226151494999027,
0.3102644121079241,0.18594233596010157,-0.29144459409954915,1.0,0.6998299673332175,-0.6978928627572585,-0.15226151494999027,
0.4079735872512211,0.42683747547446615,-0.42187039500684476,1.0,0.9329544541427676,-0.10625664316090311,-0.34395568359797035,
0.4296891856283356,0.6790788590588621,-0.44089220150003994,1.0,0.9329544541427676,-0.10625664316090311,-0.34395568359797035,
0.47507048939055463,0.5127229792199752,-0.2664072032766205,1.0,0.9329544541427676,-0.10625664316090311,-0.34395568359797035,
-0.6103880841484028,0.022873359646924163,-0.08556507655822643,1.0,-0.5605017376932928,-0.7485914759900046,0.3541872444313962,
-0.5873063091103234,-0.07698791098918356,-0.2600996537733744,1.0,-0.5605017376932928,-0.7485914759900046,0.3541872444313962,
-0.34661315808077897,-0.19966837163310458,-0.13849340461690596,1.0,-0.5605017376932928,-0.7485914759900046,0.3541872444313962,
-0.3143629420908196,-0.23314704486256066,-0.34325647671485937,1.0,0.17500525407864195,-0.9834728441293886,0.04641471646925392,
-0.14991126278610056,-0.20341066737913527,-0.3332378478677821,1.0,0.17500525407864195,-0.9834728441293886,0.04641471646925392,
-0.19792943440469868,-0.20229973071262453,-0.1286473841114023,1.0,0.17500525407864195,-0.9834728441293886,0.04641471646925392,
-0.16755403880566055,-0.15303841178290656,-0.43214426384837645,1.0,0.09984663560372027,-0.6009137094839418,-0.7930531905949731,
-0.302800019464345,-0.19376847161740451,-0.41830988889715215,1.0,0.09984663560372027,-0.6009137094839418,-0.7930531905949731,
-0.19444237865312242,-0.034572165435914126,-0.5252940080115979,1.0,0.09984663560372027,-0.6009137094839418,-0.7930531905949731,
-0.39180532717084826,0.028536382257698722,-0.5500265798483435,1.0,-0.15307495839525379,-0.285596310597824,-0.9460458786365503,
-0.5653336344798017,0.24375144031561624,-0.5869188584712594,1.0,-0.15307495839525379,-0.285596310597824,-0.9460458786365503,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,-0.15307495839525379,-0.285596310597824,-0.9460458786365503,
0.23412577088446151,0.1290862500011476,-0.38079511848919956,1.0,0.7878668516785939,-0.5080315283420243,-0.34809451336745834,
0.4079735872512211,0.42683747547446615,-0.42187039500684476,1.0,0.7878668516785939,-0.5080315283420243,-0.34809451336745834,
0.3102644121079241,0.18594233596010157,-0.29144459409954915,1.0,0.7878668516785939,-0.5080315283420243,-0.34809451336745834,
0.1996885704815865,0.1970021236334789,-0.49114877278223534,1.0,0.4272510811627923,-0.36557155765060834,-0.8269304383575036,
0.08561098303204906,0.24596045983596704,-0.5717329969306932,1.0,0.4272510811627923,-0.36557155765060834,-0.8269304383575036,
0.25684580290881764,0.38965874045489635,-0.5467874190554101,1.0,0.4272510811627923,-0.36557155765060834,-0.8269304383575036,
-0.19444237865312242,-0.034572165435914126,-0.5252940080115979,1.0,-0.06234338591932842,-0.5271120267351409,-0.8475058781526448,
-0.302800019464345,-0.19376847161740451,-0.41830988889715215,1.0,-0.06234338591932842,-0.5271120267351409,-0.8475058781526448,
-0.39180532717084826,0.028536382257698722,-0.5500265798483435,1.0,-0.06234338591932842,-0.5271120267351409,-0.8475058781526448,
-0.302800019464345,-0.19376847161740451,-0.41830988889715215,1.0,-0.30234769375184506,-0.572578381658646,-0.7620629035323175,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.30234769375184506,-0.572578381658646,-0.7620629035323175,
-0.39180532717084826,0.028536382257698722,-0.5500265798483435,1.0,-0.30234769375184506,-0.572578381658646,-0.7620629035323175,
0.25684580290881764,0.38965874045489635,-0.5467874190554101,1.0,0.30382272950100403,-0.2003511354731141,-0.9314242704338306,
0.08561098303204906,0.24596045983596704,-0.5717329969306932,1.0,0.30382272950100403,-0.2003511354731141,-0.9314242704338306,
0.008904937792137302,0.32020408182002646,-0.6127238055365044,1.0,0.30382272950100403,-0.2003511354731141,-0.9314242704338306,
-0.19444237865312242,-0.034572165435914126,-0.5252940080115979,1.0,-0.009251594894119884,-0.3898173250513355,-0.9208457314239649,
-0.39180532717084826,0.028536382257698722,-0.5500265798483435,1.0,-0.009251594894119884,-0.3898173250513355,-0.9208457314239649,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,-0.009251594894119884,-0.3898173250513355,-0.9208457314239649,
0.0266321817235311,-0.09701047861171486,-0.2981671381261529,1.0,0.6242177739507765,-0.69979276212757,-0.34733594797803996,
0.017382945377723003,-0.04324114395260248,-0.4231208873537764,1.0,0.6242177739507765,-0.69979276212757,-0.34733594797803996,
0.23412577088446151,0.1290862500011476,-0.38079511848919956,1.0,0.6242177739507765,-0.69979276212757,-0.34733594797803996,
-0.19792943440469868,-0.20229973071262453,-0.1286473841114023,1.0,0.49469701297258395,-0.8606316974288901,0.1207805726790136,
-0.14991126278610056,-0.20341066737913527,-0.3332378478677821,1.0,0.49469701297258395,-0.8606316974288901,0.1207805726790136,
0.0266321817235311,-0.09701047861171486,-0.2981671381261529,1.0,0.49469701297258395,-0.8606316974288901,0.1207805726790136,
0.4079735872512211,0.42683747547446615,-0.42187039500684476,1.0,0.6427534295275076,-0.38239723368978595,-0.6638074905400109,
0.1996885704815865,0.1970021236334789,-0.49114877278223534,1.0,0.6427534295275076,-0.38239723368978595,-0.6638074905400109,
0.25684580290881764,0.38965874045489635,-0.5467874190554101,1.0,0.6427534295275076,-0.38239723368978595,-0.6638074905400109,
0.4296891856283356,0.6790788590588621,-0.44089220150003994,1.0,0.7391826792632716,-0.11369746532402432,-0.663838725185616,
0.4079735872512211,0.42683747547446615,-0.42187039500684476,1.0,0.7391826792632716,-0.11369746532402432,-0.663838725185616,
0.33510715948184444,0.5517636808177961,-0.5244034224194365,1.0,0.7391826792632716,-0.11369746532402432,-0.663838725185616,
-0.04174642916493376,0.06895060555229615,-0.5458068567745561,1.0,0.1537937388605789,-0.2831328109906677,-0.9466695818646581,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,0.1537937388605789,-0.2831328109906677,-0.9466695818646581,
0.008904937792137302,0.32020408182002646,-0.6127238055365044,1.0,0.1537937388605789,-0.2831328109906677,-0.9466695818646581,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,0.002067615344602917,-0.043347628108785605,-0.9990579102855496,
-0.3706938579892415,0.42227437197648476,-0.6273239004710922,1.0,0.002067615344602917,-0.043347628108785605,-0.9990579102855496,
-0.11353313666999953,0.41232184845171216,-0.6263598645208145,1.0,0.002067615344602917,-0.043347628108785605,-0.9990579102855496,
0.33510715948184444,0.5517636808177961,-0.5244034224194365,1.0,0.6530823479134944,-0.21503186595574578,-0.7261162052091853,
0.4079735872512211,0.42683747547446615,-0.42187039500684476,1.0,0.6530823479134944,-0.21503186595574578,-0.7261162052091853,
0.25684580290881764,0.38965874045489635,-0.5467874190554101,1.0,0.6530823479134944,-0.21503186595574578,-0.7261162052091853,
0.33510715948184444,0.5517636808177961,-0.5244034224194365,1.0,0.38740207314961145,0.08628591248683498,-0.9178640286151851,
0.1931000733585453,0.5120472359253043,-0.5880738653526398,1.0,0.38740207314961145,0.08628591248683498,-0.9178640286151851,
0.20081236096076727,0.7214486981383088,-0.5651334822539344,1.0,0.38740207314961145,0.08628591248683498,-0.9178640286151851,
0.23412577088446151,0.1290862500011476,-0.38079511848919956,1.0,0.582926438903635,-0.5980839201476386,-0.5499930829455584,
0.017382945377723003,-0.04324114395260248,-0.4231208873537764,1.0,0.582926438903635,-0.5980839201476386,-0.5499930829455584,
0.1996885704815865,0.1970021236334789,-0.49114877278223534,1.0,0.582926438903635,-0.5980839201476386,-0.5499930829455584,
0.23412577088446151,0.1290862500011476,-0.38079511848919956,1.0,0.7057605289669547,-0.48350447049079026,-0.5178083649070424,
0.1996885704815865,0.1970021236334789,-0.49114877278223534,1.0,0.7057605289669547,-0.48350447049079026,-0.5178083649070424,
0.4079735872512211,0.42683747547446615,-0.42187039500684476,1.0,0.7057605289669547,-0.48350447049079026,-0.5178083649070424,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,0.11366195623252902,-0.351763166300278,-0.9291628676070721,
-0.04174642916493376,0.06895060555229615,-0.5458068567745561,1.0,0.11366195623252902,-0.351763166300278,-0.9291628676070721,
-0.19444237865312242,-0.034572165435914126,-0.5252940080115979,1.0,0.11366195623252902,-0.351763166300278,-0.9291628676070721,
-0.04174642916493376,0.06895060555229615,-0.5458068567745561,1.0,0.27146447253743383,-0.5560661354974779,-0.7855555315207662,
-0.16755403880566055,-0.15303841178290656,-0.43214426384837645,1.0,0.27146447253743383,-0.5560661354974779,-0.7855555315207662,
-0.19444237865312242,-0.034572165435914126,-0.5252940080115979,1.0,0.27146447253743383,-0.5560661354974779,-0.7855555315207662,
0.0266321817235311,-0.09701047861171486,-0.2981671381261529,1.0,0.5325306541007272,-0.7624589336186742,-0.3675152744963478,
-0.14991126278610056,-0.20341066737913527,-0.3332378478677821,1.0,0.5325306541007272,-0.7624589336186742,-0.3675152744963478,
0.017382945377723003,-0.04324114395260248,-0.4231208873537764,1.0,0.5325306541007272,-0.7624589336186742,-0.3675152744963478,
-0.14991126278610056,-0.20341066737913527,-0.3332378478677821,1.0,0.20931316849656043,-0.8557482098900465,-0.47316276138757124,
-0.302800019464345,-0.19376847161740451,-0.41830988889715215,1.0,0.20931316849656043,-0.8557482098900465,-0.47316276138757124,
-0.16755403880566055,-0.15303841178290656,-0.43214426384837645,1.0,0.20931316849656043,-0.8557482098900465,-0.47316276138757124,
0.33510715948184444,0.5517636808177961,-0.5244034224194365,1.0,0.4266722788559951,-0.08161579460117326,-0.900716175344626,
0.25684580290881764,0.38965874045489635,-0.5467874190554101,1.0,0.4266722788559951,-0.08161579460117326,-0.900716175344626,
0.1931000733585453,0.5120472359253043,-0.5880738653526398,1.0,0.4266722788559951,-0.08161579460117326,-0.900716175344626,
0.1931000733585453,0.5120472359253043,-0.5880738653526398,1.0,0.2960207415266893,-0.1632950329428992,-0.9411197866383251,
0.25684580290881764,0.38965874045489635,-0.5467874190554101,1.0,0.2960207415266893,-0.1632950329428992,-0.9411197866383251,
0.008904937792137302,0.32020408182002646,-0.6127238055365044,1.0,0.2960207415266893,-0.1632950329428992,-0.9411197866383251,
-0.49997383330992107,0.33550746393357866,-0.6173419968030732,1.0,-0.18518212067006334,-0.02329008411406578,-0.9824281928803233,
-0.7814815120857974,0.42474781278605445,-0.5663949921545837,1.0,-0.18518212067006334,-0.02329008411406578,-0.9824281928803233,
-0.6526973266824034,0.6827697395542114,-0.5967869140841979,1.0,-0.18518212067006334,-0.02329008411406578,-0.9824281928803233,
-0.5653336344798017,0.24375144031561624,-0.5869188584712594,1.0,-0.40776467677574896,-0.39352836208350234,-0.8239316698670132,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.40776467677574896,-0.39352836208350234,-0.8239316698670132,
-0.7814815120857974,0.42474781278605445,-0.5663949921545837,1.0,-0.40776467677574896,-0.39352836208350234,-0.8239316698670132,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,-0.14150102728908143,-0.21928130016353814,-0.9653461403427908,
-0.5653336344798017,0.24375144031561624,-0.5869188584712594,1.0,-0.14150102728908143,-0.21928130016353814,-0.9653461403427908,
-0.49997383330992107,0.33550746393357866,-0.6173419968030732,1.0,-0.14150102728908143,-0.21928130016353814,-0.9653461403427908,
-0.5653336344798017,0.24375144031561624,-0.5869188584712594,1.0,-0.22438955851894601,-0.15894607108455466,-0.9614496723773202,
-0.7814815120857974,0.42474781278605445,-0.5663949921545837,1.0,-0.22438955851894601,-0.15894607108455466,-0.9614496723773202,
-0.49997383330992107,0.33550746393357866,-0.6173419968030732,1.0,-0.22438955851894601,-0.15894607108455466,-0.9614496723773202,
0.017382945377723003,-0.04324114395260248,-0.4231208873537764,1.0,0.3813041254484614,-0.5833094737573513,-0.7171870200588588,
-0.16755403880566055,-0.15303841178290656,-0.43214426384837645,1.0,0.3813041254484614,-0.5833094737573513,-0.7171870200588588,
-0.04174642916493376,0.06895060555229615,-0.5458068567745561,1.0,0.3813041254484614,-0.5833094737573513,-0.7171870200588588,
-0.16755403880566055,-0.15303841178290656,-0.43214426384837645,1.0,0.46841867388128733,-0.7506939225854005,-0.4658782894197163,
0.017382945377723003,-0.04324114395260248,-0.4231208873537764,1.0,0.46841867388128733,-0.7506939225854005,-0.4658782894197163,
-0.14991126278610056,-0.20341066737913527,-0.3332378478677821,1.0,0.46841867388128733,-0.7506939225854005,-0.4658782894197163,
0.008904937792137302,0.32020408182002646,-0.6127238055365044,1.0,0.11245091304875814,0.002374597965152884,-0.993654443676978,
-0.11353313666999953,0.41232184845171216,-0.6263598645208145,1.0,0.11245091304875814,0.002374597965152884,-0.993654443676978,
0.09095266032606442,0.6309248042777489,-0.6026959953946626,1.0,0.11245091304875814,0.002374597965152884,-0.993654443676978,
0.008904937792137302,0.32020408182002646,-0.6127238055365044,1.0,0.0526930858097965,-0.07734200777261427,-0.9956111954681619,
-0.2680488187805221,0.18318794753073653,-0.6167378676075658,1.0,0.0526930858097965,-0.07734200777261427,-0.9956111954681619,
-0.11353313666999953,0.41232184845171216,-0.6263598645208145,1.0,0.0526930858097965,-0.07734200777261427,-0.9956111954681619,
0.1996885704815865,0.1970021236334789,-0.49114877278223534,1.0,0.40254971717723664,-0.40954099133033095,-0.8186756999085146,
-0.04174642916493376,0.06895060555229615,-0.5458068567745561,1.0,0.40254971717723664,-0.40954099133033095,-0.8186756999085146,
0.08561098303204906,0.24596045983596704,-0.5717329969306932,1.0,0.40254971717723664,-0.40954099133033095,-0.8186756999085146,
-0.04174642916493376,0.06895060555229615,-0.5458068567745561,1.0,0.21568043693118905,-0.29167125238146613,-0.9318850946653232,
0.008904937792137302,0.32020408182002646,-0.6127238055365044,1.0,0.21568043693118905,-0.29167125238146613,-0.9318850946653232,
0.08561098303204906,0.24596045983596704,-0.5717329969306932,1.0,0.21568043693118905,-0.29167125238146613,-0.9318850946653232,
-0.003012382812249026,0.9965478331685291,-0.288835270127464,1.0,-0.516784615064272,0.8560151250790496,0.013106001250235541,
-0.2631680424836871,0.840875307917673,-0.37935916398802394,1.0,-0.516784615064272,0.8560151250790496,0.013106001250235541,
-0.26267408882535437,0.8375847318740584,-0.1449588723901022,1.0,-0.516784615064272,0.8560151250790496,0.013106001250235541,
-0.4855316566452835,0.9811599831431426,-0.3208743163378386,1.0,0.5355558104915705,0.8444317209776431,0.010725784607794884,
-0.26267408882535437,0.8375847318740584,-0.1449588723901022,1.0,0.5355558104915705,0.8444317209776431,0.010725784607794884,
-0.2631680424836871,0.840875307917673,-0.37935916398802394,1.0,0.5355558104915705,0.8444317209776431,0.010725784607794884,
-0.7880296115118746,0.1375073335591932,-0.19187345237800135,1.0,-0.7310666791675368,-0.6822813340629397,-0.005804463820655905,
-0.7799500721190704,0.13014944393488248,-0.3446061270452482,1.0,-0.7310666791675368,-0.6822813340629397,-0.005804463820655905,
-0.5873063091103234,-0.07698791098918356,-0.2600996537733744,1.0,-0.7310666791675368,-0.6822813340629397,-0.005804463820655905,
-0.988853908155836,0.4793104113128239,-0.3347913229419439,1.0,-0.8547493066503296,-0.5084687705132244,-0.10422635076385932,
-0.7799500721190704,0.13014944393488248,-0.3446061270452482,1.0,-0.8547493066503296,-0.5084687705132244,-0.10422635076385932,
-0.9408687891983903,0.3688851429206248,-0.18960200005325156,1.0,-0.8547493066503296,-0.5084687705132244,-0.10422635076385932,
0.24499826014464188,0.973354046334322,-0.3019994105608762,1.0,0.7178722767507194,0.6952832921190587,0.03522127159575716,
0.37023112073310793,0.8354913966677409,-0.132999317829799,1.0,0.7178722767507194,0.6952832921190587,0.03522127159575716,
0.44259624980834045,0.771097467707091,-0.3367653013163222,1.0,0.7178722767507194,0.6952832921190587,0.03522127159575716,
0.44259624980834045,0.771097467707091,-0.3367653013163222,1.0,0.9012992968575014,0.3851002094544135,0.19838701107265103,
0.37023112073310793,0.8354913966677409,-0.132999317829799,1.0,0.9012992968575014,0.3851002094544135,0.19838701107265103,
0.4610139271060283,0.6326270163270964,-0.15164652749660068,1.0,0.9012992968575014,0.3851002094544135,0.19838701107265103,
-0.11288310100066945,-0.004233495015934174,0.0007464392643579121,1.0,0.15597676702904306,-0.33252155336567935,0.9301078779875178,
0.05080469457963899,0.22043646039051712,0.053617843295497236,1.0,0.15597676702904306,-0.33252155336567935,0.9301078779875178,
-0.26895225818535384,0.13075724564829572,0.07517919592056699,1.0,0.15597676702904306,-0.33252155336567935,0.9301078779875178,
-0.059545287195490904,0.3566115880793739,0.09954818848463654,1.0,0.1775228805982944,-0.012962458768488139,0.9840313010909557,
0.24522044747794425,0.4706083801349832,0.046068982740083975,1.0,0.1775228805982944,-0.012962458768488139,0.9840313010909557,
0.16536154561588567,0.6738840824810794,0.06315353603795915,1.0,0.1775228805982944,-0.012962458768488139,0.9840313010909557,
-0.27416172483475965,0.7429880156559439,-0.02565161944267713,1.0,0.2892651929527314,0.4530170053405497,0.8432681904461351,
-0.5143811210544533,0.8331097688058162,0.008335697516735241,1.0,0.2892651929527314,0.4530170053405497,0.8432681904461351,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,0.2892651929527314,0.4530170053405497,0.8432681904461351,
-0.26267408882535437,0.8375847318740584,-0.1449588723901022,1.0,0.4484929538860216,0.8809663227976358,0.1508390148834271,
-0.4855316566452835,0.9811599831431426,-0.3208743163378386,1.0,0.4484929538860216,0.8809663227976358,0.1508390148834271,
-0.4913929952229723,0.945509015572394,-0.095229307427392,1.0,0.4484929538860216,0.8809663227976358,0.1508390148834271,
-0.988853908155836,0.4793104113128239,-0.3347913229419439,1.0,-0.9630214533401592,-0.22636102651478304,0.14611764466272148,
-0.9408687891983903,0.3688851429206248,-0.18960200005325156,1.0,-0.9630214533401592,-0.22636102651478304,0.14611764466272148,
-0.9781099570223593,0.5694119656142147,-0.12439828089436833,1.0,-0.9630214533401592,-0.22636102651478304,0.14611764466272148,
-0.876463842684023,0.6813374575709414,-0.019287145911890846,1.0,-0.37689068460773933,0.08431950872431836,0.9224118561165611,
-0.7336194224781968,0.46794213213535807,0.05858492376311886,1.0,-0.37689068460773933,0.08431950872431836,0.9224118561165611,
-0.6578608868579865,0.7030750910554908,0.06804532988851153,1.0,-0.37689068460773933,0.08431950872431836,0.9224118561165611,
-0.2732289052866814,0.5560715443213231,-0.6020514685021912,1.0,0.099344364284701,0.33645322728605404,-0.9364453658028681,
-0.6526973266824034,0.6827697395542114,-0.5967869140841979,1.0,0.099344364284701,0.33645322728605404,-0.9364453658028681,
-0.5293025613058004,0.9010384962508182,-0.5052751129069724,1.0,0.099344364284701,0.33645322728605404,-0.9364453658028681,
-0.8792861726946457,0.8801400331077489,-0.33021536563129217,1.0,-0.7582457415113781,0.4663928001875317,-0.4555668462619874,
-0.8611549517936118,0.7491872258809682,-0.4944577114153792,1.0,-0.7582457415113781,0.4663928001875317,-0.4555668462619874,
-1.0,0.6896630556634356,-0.32430261180292175,1.0,-0.7582457415113781,0.4663928001875317,-0.4555668462619874,
0.16536154561588567,0.6738840824810794,0.06315353603795915,1.0,0.4309422216057965,0.09386986143224292,0.8974838442847604,
0.24522044747794425,0.4706083801349832,0.046068982740083975,1.0,0.4309422216057965,0.09386986143224292,0.8974838442847604,
0.3530529182286344,0.69739554211414,-0.0294288041088131,1.0,0.4309422216057965,0.09386986143224292,0.8974838442847604,
0.17266985624846787,0.9705757865385691,-0.14766000930983292,1.0,0.5311050388116102,0.8053281104869464,0.26338958257387973,
0.37023112073310793,0.8354913966677409,-0.132999317829799,1.0,0.5311050388116102,0.8053281104869464,0.26338958257387973,
0.24499826014464188,0.973354046334322,-0.3019994105608762,1.0,0.5311050388116102,0.8053281104869464,0.26338958257387973,
-0.008642352761871308,0.9566918325956162,-0.4295367761352441,1.0,-0.30221424664483126,0.6017372279413089,-0.7393097169890345,
0.024929969674183372,0.8323679201888408,-0.5444498614083555,1.0,-0.30221424664483126,0.6017372279413089,-0.7393097169890345,
-0.25608191918440726,0.7357256114971846,-0.5082369985980163,1.0,-0.30221424664483126,0.6017372279413089,-0.7393097169890345,
0.2065451614117526,0.9077481864647516,-0.4618310623400733,1.0,0.6111996957858049,0.6696446224471245,-0.42191351187060583,
0.24499826014464188,0.973354046334322,-0.3019994105608762,1.0,0.6111996957858049,0.6696446224471245,-0.42191351187060583,
0.44259624980834045,0.771097467707091,-0.3367653013163222,1.0,0.6111996957858049,0.6696446224471245,-0.42191351187060583,
-0.5873063091103234,-0.07698791098918356,-0.2600996537733744,1.0,-0.640628019698221,-0.6999280062363916,0.3157475676287714,
-0.6103880841484028,0.022873359646924163,-0.08556507655822643,1.0,-0.640628019698221,-0.6999280062363916,0.3157475676287714,
-0.7880296115118746,0.1375073335591932,-0.19187345237800135,1.0,-0.640628019698221,-0.6999280062363916,0.3157475676287714,
-0.9408687891983903,0.3688851429206248,-0.18960200005325156,1.0,-0.8250464441105341,-0.3073962361736848,0.4741370256021096,
-0.8554313326373912,0.3835807233207642,-0.031404618742144286,1.0,-0.8250464441105341,-0.3073962361736848,0.4741370256021096,
-0.9781099570223593,0.5694119656142147,-0.12439828089436833,1.0,-0.8250464441105341,-0.3073962361736848,0.4741370256021096,
-0.6808673752789967,0.9797148473472024,-0.3760502253548801,1.0,-0.1766192998952287,0.7350092287654689,-0.6546503315008021,
-0.5293025613058004,0.9010384962508182,-0.5052751129069724,1.0,-0.1766192998952287,0.7350092287654689,-0.6546503315008021,
-0.7666041420493201,0.8761094447061111,-0.46924220347401835,1.0,-0.1766192998952287,0.7350092287654689,-0.6546503315008021,
-0.4855316566452835,0.9811599831431426,-0.3208743163378386,1.0,0.02920492676575619,0.9911685116830169,-0.12935243987138442,
-0.6808673752789967,0.9797148473472024,-0.3760502253548801,1.0,0.02920492676575619,0.9911685116830169,-0.12935243987138442,
-0.6078173216143287,1.0,-0.20412129959391145,1.0,0.02920492676575619,0.9911685116830169,-0.12935243987138442,
-0.11288310100066945,-0.004233495015934174,0.0007464392643579121,1.0,0.4400200750514677,-0.5449876299817673,0.7137021904958377,
0.013273397841110146,-0.062387816054595646,-0.12144006772123017,1.0,0.4400200750514677,-0.5449876299817673,0.7137021904958377,
0.18563384445601283,0.2031021758750462,-0.024975876148006226,1.0,0.4400200750514677,-0.5449876299817673,0.7137021904958377,
0.37239974255649466,0.4454314336316334,-0.04935037748893423,1.0,0.7475725685558072,-0.47370516973511606,0.46555200236826166,
0.2181466454762382,0.10207671706279364,-0.1510221994526113,1.0,0.7475725685558072,-0.47370516973511606,0.46555200236826166,
0.42752423632285463,0.4144390550244177,-0.16940315157124086,1.0,0.7475725685558072,-0.47370516973511606,0.46555200236826166,
-0.6578608868579865,0.7030750910554908,0.06804532988851153,1.0,-0.37396264845955735,0.4010575423753162,0.8362444530524462,
-0.7149446689271015,0.9178586282594743,-0.060490960556239703,1.0,-0.37396264845955735,0.4010575423753162,0.8362444530524462,
-0.876463842684023,0.6813374575709414,-0.019287145911890846,1.0,-0.37396264845955735,0.4010575423753162,0.8362444530524462,
-0.27416172483475965,0.7429880156559439,-0.02565161944267713,1.0,0.3289556721379428,0.6026369683179176,0.7270604171489901,
-0.4913929952229723,0.945509015572394,-0.095229307427392,1.0,0.3289556721379428,0.6026369683179176,0.7270604171489901,
-0.5143811210544533,0.8331097688058162,0.008335697516735241,1.0,0.3289556721379428,0.6026369683179176,0.7270604171489901,
-0.8665535531151675,0.3186083727899476,-0.4309598768237495,1.0,-0.8062619439191501,-0.31332544553762115,-0.5017657251809498,
-0.988853908155836,0.4793104113128239,-0.3347913229419439,1.0,-0.8062619439191501,-0.31332544553762115,-0.5017657251809498,
-0.9240963999225098,0.5460620967690106,-0.4805296872575564,1.0,-0.8062619439191501,-0.31332544553762115,-0.5017657251809498,
-1.0,0.6896630556634356,-0.32430261180292175,1.0,-0.7922346547760445,0.20610321043113586,-0.5743567866943514,
-0.8611549517936118,0.7491872258809682,-0.4944577114153792,1.0,-0.7922346547760445,0.20610321043113586,-0.5743567866943514,
-0.9240963999225098,0.5460620967690106,-0.4805296872575564,1.0,-0.7922346547760445,0.20610321043113586,-0.5743567866943514,
0.3530529182286344,0.69739554211414,-0.0294288041088131,1.0,0.372413072391216,0.3731408687400929,0.8497496075833302,
0.17986064630806364,0.8643830950328275,-0.026852532797880246,1.0,0.372413072391216,0.3731408687400929,0.8497496075833302,
0.16536154561588567,0.6738840824810794,0.06315353603795915,1.0,0.372413072391216,0.3731408687400929,0.8497496075833302,
0.002305423115378513,0.9157965094553564,-0.04498191743996127,1.0,-0.24793744163816736,0.4684444426088893,0.8479898756605337,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,-0.24793744163816736,0.4684444426088893,0.8479898756605337,
0.04253051173782607,0.7678564706552047,0.048503862111642704,1.0,-0.24793744163816736,0.4684444426088893,0.8479898756605337,
-0.4449723688934061,0.31038009642195763,0.099024854683057,1.0,-0.012371498807555076,0.07197203268388508,0.9973299216049845,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,-0.012371498807555076,0.07197203268388508,0.9973299216049845,
-0.6578608868579865,0.7030750910554908,0.06804532988851153,1.0,-0.012371498807555076,0.07197203268388508,0.9973299216049845,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,0.017322633934331286,0.10181797496104995,0.9946522137553448,
-0.059545287195490904,0.3566115880793739,0.09954818848463654,1.0,0.017322633934331286,0.10181797496104995,0.9946522137553448,
0.16536154561588567,0.6738840824810794,0.06315353603795915,1.0,0.017322633934331286,0.10181797496104995,0.9946522137553448,
-0.003012382812249026,0.9965478331685291,-0.288835270127464,1.0,0.09624175537722433,0.9933632793544183,0.06298348793252523,
0.17266985624846787,0.9705757865385691,-0.14766000930983292,1.0,0.09624175537722433,0.9933632793544183,0.06298348793252523,
0.24499826014464188,0.973354046334322,-0.3019994105608762,1.0,0.09624175537722433,0.9933632793544183,0.06298348793252523,
0.24499826014464188,0.973354046334322,-0.3019994105608762,1.0,0.14449113772459043,0.9026967975376734,-0.4052910100585529,
0.2065451614117526,0.9077481864647516,-0.4618310623400733,1.0,0.14449113772459043,0.9026967975376734,-0.4052910100585529,
-0.008642352761871308,0.9566918325956162,-0.4295367761352441,1.0,0.14449113772459043,0.9026967975376734,-0.4052910100585529,
-0.25608191918440726,0.7357256114971846,-0.5082369985980163,1.0,-0.42859434487851517,0.688369003950785,-0.5851965498342933,
-0.2631680424836871,0.840875307917673,-0.37935916398802394,1.0,-0.42859434487851517,0.688369003950785,-0.5851965498342933,
-0.008642352761871308,0.9566918325956162,-0.4295367761352441,1.0,-0.42859434487851517,0.688369003950785,-0.5851965498342933,
-0.5293025613058004,0.9010384962508182,-0.5052751129069724,1.0,0.4251298525914828,0.7126312968214294,-0.5580512908560932,
-0.2631680424836871,0.840875307917673,-0.37935916398802394,1.0,0.4251298525914828,0.7126312968214294,-0.5580512908560932,
-0.25608191918440726,0.7357256114971846,-0.5082369985980163,1.0,0.4251298525914828,0.7126312968214294,-0.5580512908560932,
-0.5510879375231255,0.12613170934591533,0.028589633767333256,1.0,-0.2503936655343268,-0.2165204141036343,0.9436217052064214,
-0.4449723688934061,0.31038009642195763,0.099024854683057,1.0,-0.2503936655343268,-0.2165204141036343,0.9436217052064214,
-0.7336194224781968,0.46794213213535807,0.05858492376311886,1.0,-0.2503936655343268,-0.2165204141036343,0.9436217052064214,
-0.7880296115118746,0.1375073335591932,-0.19187345237800135,1.0,-0.6603369433615873,-0.5286759729095837,0.5333449511338614,
-0.6103880841484028,0.022873359646924163,-0.08556507655822643,1.0,-0.6603369433615873,-0.5286759729095837,0.5333449511338614,
-0.8554313326373912,0.3835807233207642,-0.031404618742144286,1.0,-0.6603369433615873,-0.5286759729095837,0.5333449511338614,
0.3102644121079241,0.18594233596010157,-0.29144459409954915,1.0,0.8168060128579826,-0.5347714208966324,0.21644275167175722,
0.42752423632285463,0.4144390550244177,-0.16940315157124086,1.0,0.8168060128579826,-0.5347714208966324,0.21644275167175722,
0.2181466454762382,0.10207671706279364,-0.1510221994526113,1.0,0.8168060128579826,-0.5347714208966324,0.21644275167175722,
0.3102644121079241,0.18594233596010157,-0.29144459409954915,1.0,0.8881709172837905,-0.4370632837395756,-0.14187356236469664,
0.4079735872512211,0.42683747547446615,-0.42187039500684476,1.0,0.8881709172837905,-0.4370632837395756,-0.14187356236469664,
0.47507048939055463,0.5127229792199752,-0.2664072032766205,1.0,0.8881709172837905,-0.4370632837395756,-0.14187356236469664,
-0.2631680424836871,0.840875307917673,-0.37935916398802394,1.0,0.3919741867543664,0.8061266165607955,-0.443301381669962,
-0.5293025613058004,0.9010384962508182,-0.5052751129069724,1.0,0.3919741867543664,0.8061266165607955,-0.443301381669962,
-0.4855316566452835,0.9811599831431426,-0.3208743163378386,1.0,0.3919741867543664,0.8061266165607955,-0.443301381669962,
-0.5293025613058004,0.9010384962508182,-0.5052751129069724,1.0,0.11144616120819181,0.9015120688171618,-0.4181575575413634,
-0.6808673752789967,0.9797148473472024,-0.3760502253548801,1.0,0.11144616120819181,0.9015120688171618,-0.4181575575413634,
-0.4855316566452835,0.9811599831431426,-0.3208743163378386,1.0,0.11144616120819181,0.9015120688171618,-0.4181575575413634,
-0.5873063091103234,-0.07698791098918356,-0.2600996537733744,1.0,-0.5435929397584777,-0.7565713513063637,-0.36346458730830883,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.5435929397584777,-0.7565713513063637,-0.36346458730830883,
-0.3143629420908196,-0.23314704486256066,-0.34325647671485937,1.0,-0.5435929397584777,-0.7565713513063637,-0.36346458730830883,
-0.5873063091103234,-0.07698791098918356,-0.2600996537733744,1.0,-0.4799109639432424,-0.8747220009271276,0.06743061456868087,
-0.3143629420908196,-0.23314704486256066,-0.34325647671485937,1.0,-0.4799109639432424,-0.8747220009271276,0.06743061456868087,
-0.34661315808077897,-0.19966837163310458,-0.13849340461690596,1.0,-0.4799109639432424,-0.8747220009271276,0.06743061456868087,
-0.6526973266824034,0.6827697395542114,-0.5967869140841979,1.0,-0.4127807198039259,0.09938310021296219,-0.9053922226031176,
-0.7814815120857974,0.42474781278605445,-0.5663949921545837,1.0,-0.4127807198039259,0.09938310021296219,-0.9053922226031176,
-0.8611549517936118,0.7491872258809682,-0.4944577114153792,1.0,-0.4127807198039259,0.09938310021296219,-0.9053922226031176,
-0.6526973266824034,0.6827697395542114,-0.5967869140841979,1.0,-0.180463999943744,0.4653316172435215,-0.866544419356465,
-0.7666041420493201,0.8761094447061111,-0.46924220347401835,1.0,-0.180463999943744,0.4653316172435215,-0.866544419356465,
-0.5293025613058004,0.9010384962508182,-0.5052751129069724,1.0,-0.180463999943744,0.4653316172435215,-0.866544419356465,
-0.876463842684023,0.6813374575709414,-0.019287145911890846,1.0,-0.5755243160542349,0.5050692230958307,0.6431771462915011,
-0.7149446689271015,0.9178586282594743,-0.060490960556239703,1.0,-0.5755243160542349,0.5050692230958307,0.6431771462915011,
-0.9431237151925639,0.7940690672079957,-0.16746038959906207,1.0,-0.5755243160542349,0.5050692230958307,0.6431771462915011,
-1.0,0.6896630556634356,-0.32430261180292175,1.0,-0.9566656353936749,0.19109716731554552,0.21971057029826935,
-0.9781099570223593,0.5694119656142147,-0.12439828089436833,1.0,-0.9566656353936749,0.19109716731554552,0.21971057029826935,
-0.9431237151925639,0.7940690672079957,-0.16746038959906207,1.0,-0.9566656353936749,0.19109716731554552,0.21971057029826935,
-0.988853908155836,0.4793104113128239,-0.3347913229419439,1.0,-0.9955793126408362,-0.05649481207393111,0.0750344484242489,
-0.9781099570223593,0.5694119656142147,-0.12439828089436833,1.0,-0.9955793126408362,-0.05649481207393111,0.0750344484242489,
-1.0,0.6896630556634356,-0.32430261180292175,1.0,-0.9955793126408362,-0.05649481207393111,0.0750344484242489,
-1.0,0.6896630556634356,-0.32430261180292175,1.0,-0.908787728846513,-0.02739384122882395,-0.41635854904244063,
-0.9240963999225098,0.5460620967690106,-0.4805296872575564,1.0,-0.908787728846513,-0.02739384122882395,-0.41635854904244063,
-0.988853908155836,0.4793104113128239,-0.3347913229419439,1.0,-0.908787728846513,-0.02739384122882395,-0.41635854904244063,
-0.6078173216143287,1.0,-0.20412129959391145,1.0,-0.25317238705948986,0.9090214382494008,0.3310343898050328,
-0.7752235415742799,0.9611906670302459,-0.22558165797657126,1.0,-0.25317238705948986,0.9090214382494008,0.3310343898050328,
-0.7149446689271015,0.9178586282594743,-0.060490960556239703,1.0,-0.25317238705948986,0.9090214382494008,0.3310343898050328,
-0.4913929952229723,0.945509015572394,-0.095229307427392,1.0,0.031377393197098535,0.6738031961480849,0.7382443444123225,
-0.7149446689271015,0.9178586282594743,-0.060490960556239703,1.0,0.031377393197098535,0.6738031961480849,0.7382443444123225,
-0.5143811210544533,0.8331097688058162,0.008335697516735241,1.0,0.031377393197098535,0.6738031961480849,0.7382443444123225,
-0.34661315808077897,-0.19966837163310458,-0.13849340461690596,1.0,-0.33442416574366773,-0.5877075600826664,0.7367226759020864,
-0.3159531423440396,-0.07289488978314707,-0.023444436181279338,1.0,-0.33442416574366773,-0.5877075600826664,0.7367226759020864,
-0.5510879375231255,0.12613170934591533,0.028589633767333256,1.0,-0.33442416574366773,-0.5877075600826664,0.7367226759020864,
-0.19792943440469868,-0.20229973071262453,-0.1286473841114023,1.0,0.38381259040679605,-0.6148699618772694,0.6889287520682168,
0.013273397841110146,-0.062387816054595646,-0.12144006772123017,1.0,0.38381259040679605,-0.6148699618772694,0.6889287520682168,
-0.11288310100066945,-0.004233495015934174,0.0007464392643579121,1.0,0.38381259040679605,-0.6148699618772694,0.6889287520682168,
-0.5873063091103234,-0.07698791098918356,-0.2600996537733744,1.0,-0.6163673988828007,-0.7111783319411026,-0.3381073938439108,
-0.7799500721190704,0.13014944393488248,-0.3446061270452482,1.0,-0.6163673988828007,-0.7111783319411026,-0.3381073938439108,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.6163673988828007,-0.7111783319411026,-0.3381073938439108,
-0.7814815120857974,0.42474781278605445,-0.5663949921545837,1.0,-0.5659813390580062,-0.43776602021379885,-0.6985886023864677,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.5659813390580062,-0.43776602021379885,-0.6985886023864677,
-0.8665535531151675,0.3186083727899476,-0.4309598768237495,1.0,-0.5659813390580062,-0.43776602021379885,-0.6985886023864677,
-0.876463842684023,0.6813374575709414,-0.019287145911890846,1.0,-0.6741775967785887,-0.07751232476700008,0.7344905768701611,
-0.9781099570223593,0.5694119656142147,-0.12439828089436833,1.0,-0.6741775967785887,-0.07751232476700008,0.7344905768701611,
-0.8554313326373912,0.3835807233207642,-0.031404618742144286,1.0,-0.6741775967785887,-0.07751232476700008,0.7344905768701611,
-0.9431237151925639,0.7940690672079957,-0.16746038959906207,1.0,-0.8103089754210967,0.22953971169766724,0.5391761169652864,
-0.9781099570223593,0.5694119656142147,-0.12439828089436833,1.0,-0.8103089754210967,0.22953971169766724,0.5391761169652864,
-0.876463842684023,0.6813374575709414,-0.019287145911890846,1.0,-0.8103089754210967,0.22953971169766724,0.5391761169652864,
-0.6578608868579865,0.7030750910554908,0.06804532988851153,1.0,0.09895344790019112,0.3230025128426569,0.9412107053396669,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,0.09895344790019112,0.3230025128426569,0.9412107053396669,
-0.5143811210544533,0.8331097688058162,0.008335697516735241,1.0,0.09895344790019112,0.3230025128426569,0.9412107053396669,
-0.5143811210544533,0.8331097688058162,0.008335697516735241,1.0,-0.08797045843412006,0.49420523922815307,0.864882870660724,
-0.7149446689271015,0.9178586282594743,-0.060490960556239703,1.0,-0.08797045843412006,0.49420523922815307,0.864882870660724,
-0.6578608868579865,0.7030750910554908,0.06804532988851153,1.0,-0.08797045843412006,0.49420523922815307,0.864882870660724,
-0.34661315808077897,-0.19966837163310458,-0.13849340461690596,1.0,-0.3559384960471888,-0.5935577963459687,0.7218011702876235,
-0.5510879375231255,0.12613170934591533,0.028589633767333256,1.0,-0.3559384960471888,-0.5935577963459687,0.7218011702876235,
-0.6103880841484028,0.022873359646924163,-0.08556507655822643,1.0,-0.3559384960471888,-0.5935577963459687,0.7218011702876235,
-0.8554313326373912,0.3835807233207642,-0.031404618742144286,1.0,-0.5352990045793966,-0.4691181786558472,0.7024123505113842,
-0.6103880841484028,0.022873359646924163,-0.08556507655822643,1.0,-0.5352990045793966,-0.4691181786558472,0.7024123505113842,
-0.5510879375231255,0.12613170934591533,0.028589633767333256,1.0,-0.5352990045793966,-0.4691181786558472,0.7024123505113842,
0.04253051173782607,0.7678564706552047,0.048503862111642704,1.0,0.07321163026666949,0.5469134079502873,0.8339818831352986,
0.17986064630806364,0.8643830950328275,-0.026852532797880246,1.0,0.07321163026666949,0.5469134079502873,0.8339818831352986,
0.002305423115378513,0.9157965094553564,-0.04498191743996127,1.0,0.07321163026666949,0.5469134079502873,0.8339818831352986,
-0.003012382812249026,0.9965478331685291,-0.288835270127464,1.0,0.0027308450317230413,0.98409083132276,0.17764509053698027,
-0.02559102289723103,0.9687817615415759,-0.13467398599485303,1.0,0.0027308450317230413,0.98409083132276,0.17764509053698027,
0.17266985624846787,0.9705757865385691,-0.14766000930983292,1.0,0.0027308450317230413,0.98409083132276,0.17764509053698027,
0.37023112073310793,0.8354913966677409,-0.132999317829799,1.0,0.7881823852456041,0.30350155536314166,0.5354020297689429,
0.3530529182286344,0.69739554211414,-0.0294288041088131,1.0,0.7881823852456041,0.30350155536314166,0.5354020297689429,
0.4610139271060283,0.6326270163270964,-0.15164652749660068,1.0,0.7881823852456041,0.30350155536314166,0.5354020297689429,
0.37023112073310793,0.8354913966677409,-0.132999317829799,1.0,0.48053624631414776,0.48714089449262227,0.729231557799878,
0.17986064630806364,0.8643830950328275,-0.026852532797880246,1.0,0.48053624631414776,0.48714089449262227,0.729231557799878,
0.3530529182286344,0.69739554211414,-0.0294288041088131,1.0,0.48053624631414776,0.48714089449262227,0.729231557799878,
-0.8792861726946457,0.8801400331077489,-0.33021536563129217,1.0,-0.48288420034853374,0.771770418192789,-0.41375508535398675,
-0.6808673752789967,0.9797148473472024,-0.3760502253548801,1.0,-0.48288420034853374,0.771770418192789,-0.41375508535398675,
-0.7666041420493201,0.8761094447061111,-0.46924220347401835,1.0,-0.48288420034853374,0.771770418192789,-0.41375508535398675,
-0.6808673752789967,0.9797148473472024,-0.3760502253548801,1.0,-0.22334851887719154,0.9745317333779738,-0.02008332031030812,
-0.7752235415742799,0.9611906670302459,-0.22558165797657126,1.0,-0.22334851887719154,0.9745317333779738,-0.02008332031030812,
-0.6078173216143287,1.0,-0.20412129959391145,1.0,-0.22334851887719154,0.9745317333779738,-0.02008332031030812,
0.05080469457963899,0.22043646039051712,0.053617843295497236,1.0,0.22315177038016978,-0.1443280187725869,0.9640397867170087,
0.24522044747794425,0.4706083801349832,0.046068982740083975,1.0,0.22315177038016978,-0.1443280187725869,0.9640397867170087,
-0.059545287195490904,0.3566115880793739,0.09954818848463654,1.0,0.22315177038016978,-0.1443280187725869,0.9640397867170087,
0.18563384445601283,0.2031021758750462,-0.024975876148006226,1.0,0.6849237737739746,-0.4720523441359573,0.5550189262673527,
0.2181466454762382,0.10207671706279364,-0.1510221994526113,1.0,0.6849237737739746,-0.4720523441359573,0.5550189262673527,
0.37239974255649466,0.4454314336316334,-0.04935037748893423,1.0,0.6849237737739746,-0.4720523441359573,0.5550189262673527,
-0.8554313326373912,0.3835807233207642,-0.031404618742144286,1.0,-0.4230230188700361,-0.30090344474965736,0.854697983175268,
-0.5510879375231255,0.12613170934591533,0.028589633767333256,1.0,-0.4230230188700361,-0.30090344474965736,0.854697983175268,
-0.7336194224781968,0.46794213213535807,0.05858492376311886,1.0,-0.4230230188700361,-0.30090344474965736,0.854697983175268,
-0.876463842684023,0.6813374575709414,-0.019287145911890846,1.0,-0.559355496864347,-0.07311342083979869,0.8256971937827704,
-0.8554313326373912,0.3835807233207642,-0.031404618742144286,1.0,-0.559355496864347,-0.07311342083979869,0.8256971937827704,
-0.7336194224781968,0.46794213213535807,0.05858492376311886,1.0,-0.559355496864347,-0.07311342083979869,0.8256971937827704,
-0.7814815120857974,0.42474781278605445,-0.5663949921545837,1.0,-0.6720163171137354,-0.3159710447144126,-0.6697435094384822,
-0.8665535531151675,0.3186083727899476,-0.4309598768237495,1.0,-0.6720163171137354,-0.3159710447144126,-0.6697435094384822,
-0.9240963999225098,0.5460620967690106,-0.4805296872575564,1.0,-0.6720163171137354,-0.3159710447144126,-0.6697435094384822,
-0.7814815120857974,0.42474781278605445,-0.5663949921545837,1.0,-0.46161845457303574,0.08247724519780032,-0.8832360423025003,
-0.9240963999225098,0.5460620967690106,-0.4805296872575564,1.0,-0.46161845457303574,0.08247724519780032,-0.8832360423025003,
-0.8611549517936118,0.7491872258809682,-0.4944577114153792,1.0,-0.46161845457303574,0.08247724519780032,-0.8832360423025003,
0.024929969674183372,0.8323679201888408,-0.5444498614083555,1.0,0.07759241255060027,0.30031426980292664,-0.9506791029928618,
0.20081236096076727,0.7214486981383088,-0.5651334822539344,1.0,0.07759241255060027,0.30031426980292664,-0.9506791029928618,
0.09095266032606442,0.6309248042777489,-0.6026959953946626,1.0,0.07759241255060027,0.30031426980292664,-0.9506791029928618,
0.024929969674183372,0.8323679201888408,-0.5444498614083555,1.0,0.04661026147938448,0.6847873877492513,-0.7272507938148846,
-0.008642352761871308,0.9566918325956162,-0.4295367761352441,1.0,0.04661026147938448,0.6847873877492513,-0.7272507938148846,
0.2065451614117526,0.9077481864647516,-0.4618310623400733,1.0,0.04661026147938448,0.6847873877492513,-0.7272507938148846,
0.20081236096076727,0.7214486981383088,-0.5651334822539344,1.0,0.19583479541313045,0.4709292429320146,-0.8601595090778087,
0.024929969674183372,0.8323679201888408,-0.5444498614083555,1.0,0.19583479541313045,0.4709292429320146,-0.8601595090778087,
0.2065451614117526,0.9077481864647516,-0.4618310623400733,1.0,0.19583479541313045,0.4709292429320146,-0.8601595090778087,
0.2065451614117526,0.9077481864647516,-0.4618310623400733,1.0,0.492561447954183,0.41038646445133303,-0.7674413135767538,
0.4296891856283356,0.6790788590588621,-0.44089220150003994,1.0,0.492561447954183,0.41038646445133303,-0.7674413135767538,
0.20081236096076727,0.7214486981383088,-0.5651334822539344,1.0,0.492561447954183,0.41038646445133303,-0.7674413135767538,
-0.34661315808077897,-0.19966837163310458,-0.13849340461690596,1.0,-0.06115779951891223,-0.6626247498515863,0.7464503764096628,
-0.19792943440469868,-0.20229973071262453,-0.1286473841114023,1.0,-0.06115779951891223,-0.6626247498515863,0.7464503764096628,
-0.3159531423440396,-0.07289488978314707,-0.023444436181279338,1.0,-0.06115779951891223,-0.6626247498515863,0.7464503764096628,
-0.34661315808077897,-0.19966837163310458,-0.13849340461690596,1.0,-0.027869119911029448,-0.9872024754192049,0.1570177846028238,
-0.3143629420908196,-0.23314704486256066,-0.34325647671485937,1.0,-0.027869119911029448,-0.9872024754192049,0.1570177846028238,
-0.19792943440469868,-0.20229973071262453,-0.1286473841114023,1.0,-0.027869119911029448,-0.9872024754192049,0.1570177846028238,
-0.26267408882535437,0.8375847318740584,-0.1449588723901022,1.0,-0.426320990527736,0.7283415867527315,0.5364409995907874,
-0.27416172483475965,0.7429880156559439,-0.02565161944267713,1.0,-0.426320990527736,0.7283415867527315,0.5364409995907874,
-0.02559102289723103,0.9687817615415759,-0.13467398599485303,1.0,-0.426320990527736,0.7283415867527315,0.5364409995907874,
-0.26267408882535437,0.8375847318740584,-0.1449588723901022,1.0,0.4470984186680803,0.6794455559857208,0.5817703502893189,
-0.4913929952229723,0.945509015572394,-0.095229307427392,1.0,0.4470984186680803,0.6794455559857208,0.5817703502893189,
-0.27416172483475965,0.7429880156559439,-0.02565161944267713,1.0,0.4470984186680803,0.6794455559857208,0.5817703502893189,
0.24522044747794425,0.4706083801349832,0.046068982740083975,1.0,0.5978349792038121,-0.017460893530798646,0.8014290079835417,
0.37239974255649466,0.4454314336316334,-0.04935037748893423,1.0,0.5978349792038121,-0.017460893530798646,0.8014290079835417,
0.3530529182286344,0.69739554211414,-0.0294288041088131,1.0,0.5978349792038121,-0.017460893530798646,0.8014290079835417,
0.18563384445601283,0.2031021758750462,-0.024975876148006226,1.0,0.5252906340013866,-0.3257791605078442,0.7860901274085724,
0.37239974255649466,0.4454314336316334,-0.04935037748893423,1.0,0.5252906340013866,-0.3257791605078442,0.7860901274085724,
0.24522044747794425,0.4706083801349832,0.046068982740083975,1.0,0.5252906340013866,-0.3257791605078442,0.7860901274085724,
-0.2732289052866814,0.5560715443213231,-0.6020514685021912,1.0,0.250321558690055,0.4292667712982757,-0.8677955728823092,
-0.5293025613058004,0.9010384962508182,-0.5052751129069724,1.0,0.250321558690055,0.4292667712982757,-0.8677955728823092,
-0.25608191918440726,0.7357256114971846,-0.5082369985980163,1.0,0.250321558690055,0.4292667712982757,-0.8677955728823092,
-0.2732289052866814,0.5560715443213231,-0.6020514685021912,1.0,-0.2688554581357019,0.46587884888995207,-0.8430146148125873,
-0.25608191918440726,0.7357256114971846,-0.5082369985980163,1.0,-0.2688554581357019,0.46587884888995207,-0.8430146148125873,
0.024929969674183372,0.8323679201888408,-0.5444498614083555,1.0,-0.2688554581357019,0.46587884888995207,-0.8430146148125873,
-0.26895225818535384,0.13075724564829572,0.07517919592056699,1.0,0.12760224800789674,-0.22259489301186766,0.9665242779715192,
0.05080469457963899,0.22043646039051712,0.053617843295497236,1.0,0.12760224800789674,-0.22259489301186766,0.9665242779715192,
-0.059545287195490904,0.3566115880793739,0.09954818848463654,1.0,0.12760224800789674,-0.22259489301186766,0.9665242779715192,
-0.4449723688934061,0.31038009642195763,0.099024854683057,1.0,-0.009746450942124521,0.06996355835971516,0.9975019334295445,
-0.059545287195490904,0.3566115880793739,0.09954818848463654,1.0,-0.009746450942124521,0.06996355835971516,0.9975019334295445,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,-0.009746450942124521,0.06996355835971516,0.9975019334295445,
0.42752423632285463,0.4144390550244177,-0.16940315157124086,1.0,0.877870492498209,-0.1711444857080563,0.4472728064757309,
0.4610139271060283,0.6326270163270964,-0.15164652749660068,1.0,0.877870492498209,-0.1711444857080563,0.4472728064757309,
0.37239974255649466,0.4454314336316334,-0.04935037748893423,1.0,0.877870492498209,-0.1711444857080563,0.4472728064757309,
0.47507048939055463,0.5127229792199752,-0.2664072032766205,1.0,0.9923989525071725,0.12287285840562322,-0.006824934424501569,
0.44259624980834045,0.771097467707091,-0.3367653013163222,1.0,0.9923989525071725,0.12287285840562322,-0.006824934424501569,
0.4610139271060283,0.6326270163270964,-0.15164652749660068,1.0,0.9923989525071725,0.12287285840562322,-0.006824934424501569,
0.4296891856283356,0.6790788590588621,-0.44089220150003994,1.0,0.9799316902449463,0.07261342095873846,-0.18563720949839646,
0.44259624980834045,0.771097467707091,-0.3367653013163222,1.0,0.9799316902449463,0.07261342095873846,-0.18563720949839646,
0.47507048939055463,0.5127229792199752,-0.2664072032766205,1.0,0.9799316902449463,0.07261342095873846,-0.18563720949839646,
0.2065451614117526,0.9077481864647516,-0.4618310623400733,1.0,0.6167685150021778,0.5503320132759956,-0.5627888361238148,
0.44259624980834045,0.771097467707091,-0.3367653013163222,1.0,0.6167685150021778,0.5503320132759956,-0.5627888361238148,
0.4296891856283356,0.6790788590588621,-0.44089220150003994,1.0,0.6167685150021778,0.5503320132759956,-0.5627888361238148,
-0.19792943440469868,-0.20229973071262453,-0.1286473841114023,1.0,0.09686541283213561,-0.5731666435423328,0.8136934868408844,
-0.11288310100066945,-0.004233495015934174,0.0007464392643579121,1.0,0.09686541283213561,-0.5731666435423328,0.8136934868408844,
-0.3159531423440396,-0.07289488978314707,-0.023444436181279338,1.0,0.09686541283213561,-0.5731666435423328,0.8136934868408844,
-0.26895225818535384,0.13075724564829572,0.07517919592056699,1.0,0.04332111690141631,-0.44352743510331455,0.8952132121126725,
-0.3159531423440396,-0.07289488978314707,-0.023444436181279338,1.0,0.04332111690141631,-0.44352743510331455,0.8952132121126725,
-0.11288310100066945,-0.004233495015934174,0.0007464392643579121,1.0,0.04332111690141631,-0.44352743510331455,0.8952132121126725,
-0.4913929952229723,0.945509015572394,-0.095229307427392,1.0,0.29473911031607025,0.9426598878605054,0.15659244128919786,
-0.4855316566452835,0.9811599831431426,-0.3208743163378386,1.0,0.29473911031607025,0.9426598878605054,0.15659244128919786,
-0.6078173216143287,1.0,-0.20412129959391145,1.0,0.29473911031607025,0.9426598878605054,0.15659244128919786,
-0.6078173216143287,1.0,-0.20412129959391145,1.0,-0.034596019595467764,0.8784513589680651,0.47657772226081807,
-0.7149446689271015,0.9178586282594743,-0.060490960556239703,1.0,-0.034596019595467764,0.8784513589680651,0.47657772226081807,
-0.4913929952229723,0.945509015572394,-0.095229307427392,1.0,-0.034596019595467764,0.8784513589680651,0.47657772226081807,
-0.9408687891983903,0.3688851429206248,-0.18960200005325156,1.0,-0.7440008739938552,-0.49585483339276465,0.447873513056324,
-0.7880296115118746,0.1375073335591932,-0.19187345237800135,1.0,-0.7440008739938552,-0.49585483339276465,0.447873513056324,
-0.8554313326373912,0.3835807233207642,-0.031404618742144286,1.0,-0.7440008739938552,-0.49585483339276465,0.447873513056324,
-0.7799500721190704,0.13014944393488248,-0.3446061270452482,1.0,-0.8343443781615256,-0.5509627082881609,-0.01759410998124422,
-0.7880296115118746,0.1375073335591932,-0.19187345237800135,1.0,-0.8343443781615256,-0.5509627082881609,-0.01759410998124422,
-0.9408687891983903,0.3688851429206248,-0.18960200005325156,1.0,-0.8343443781615256,-0.5509627082881609,-0.01759410998124422,
-0.003012382812249026,0.9965478331685291,-0.288835270127464,1.0,-0.4401643049101293,0.868389954531939,-0.22837309725753493,
-0.008642352761871308,0.9566918325956162,-0.4295367761352441,1.0,-0.4401643049101293,0.868389954531939,-0.22837309725753493,
-0.2631680424836871,0.840875307917673,-0.37935916398802394,1.0,-0.4401643049101293,0.868389954531939,-0.22837309725753493,
0.24499826014464188,0.973354046334322,-0.3019994105608762,1.0,0.07507801017680236,0.9586363449120198,-0.2745535477855185,
-0.008642352761871308,0.9566918325956162,-0.4295367761352441,1.0,0.07507801017680236,0.9586363449120198,-0.2745535477855185,
-0.003012382812249026,0.9965478331685291,-0.288835270127464,1.0,0.07507801017680236,0.9586363449120198,-0.2745535477855185,
-0.26895225818535384,0.13075724564829572,0.07517919592056699,1.0,0.012939943875139798,-0.11911725630978834,0.9927958687976781,
-0.059545287195490904,0.3566115880793739,0.09954818848463654,1.0,0.012939943875139798,-0.11911725630978834,0.9927958687976781,
-0.4449723688934061,0.31038009642195763,0.099024854683057,1.0,0.012939943875139798,-0.11911725630978834,0.9927958687976781,
-0.5510879375231255,0.12613170934591533,0.028589633767333256,1.0,-0.15224029480891207,-0.2752042402569095,0.9492552442736952,
-0.26895225818535384,0.13075724564829572,0.07517919592056699,1.0,-0.15224029480891207,-0.2752042402569095,0.9492552442736952,
-0.4449723688934061,0.31038009642195763,0.099024854683057,1.0,-0.15224029480891207,-0.2752042402569095,0.9492552442736952,
0.17986064630806364,0.8643830950328275,-0.026852532797880246,1.0,0.4292283513088319,0.6908854830301111,0.5817561961603436,
0.37023112073310793,0.8354913966677409,-0.132999317829799,1.0,0.4292283513088319,0.6908854830301111,0.5817561961603436,
0.17266985624846787,0.9705757865385691,-0.14766000930983292,1.0,0.4292283513088319,0.6908854830301111,0.5817561961603436,
0.17266985624846787,0.9705757865385691,-0.14766000930983292,1.0,0.1501655497655508,0.7469754452557261,0.6476712065922181,
0.002305423115378513,0.9157965094553564,-0.04498191743996127,1.0,0.1501655497655508,0.7469754452557261,0.6476712065922181,
0.17986064630806364,0.8643830950328275,-0.026852532797880246,1.0,0.1501655497655508,0.7469754452557261,0.6476712065922181,
-0.7752235415742799,0.9611906670302459,-0.22558165797657126,1.0,-0.4752875193490316,0.8585474862961691,-0.19234860988729122,
-0.6808673752789967,0.9797148473472024,-0.3760502253548801,1.0,-0.4752875193490316,0.8585474862961691,-0.19234860988729122,
-0.8792861726946457,0.8801400331077489,-0.33021536563129217,1.0,-0.4752875193490316,0.8585474862961691,-0.19234860988729122,
-0.7752235415742799,0.9611906670302459,-0.22558165797657126,1.0,-0.6802602044228543,0.7237454689481613,0.11592476204669348,
-0.8792861726946457,0.8801400331077489,-0.33021536563129217,1.0,-0.6802602044228543,0.7237454689481613,0.11592476204669348,
-0.9431237151925639,0.7940690672079957,-0.16746038959906207,1.0,-0.6802602044228543,0.7237454689481613,0.11592476204669348,
-0.8665535531151675,0.3186083727899476,-0.4309598768237495,1.0,-0.6529517370549877,-0.5423187558200077,-0.5287195817848183,
-0.5943740698200741,0.028892616494563095,-0.4699252918045008,1.0,-0.6529517370549877,-0.5423187558200077,-0.5287195817848183,
-0.7799500721190704,0.13014944393488248,-0.3446061270452482,1.0,-0.6529517370549877,-0.5423187558200077,-0.5287195817848183,
-0.8665535531151675,0.3186083727899476,-0.4309598768237495,1.0,-0.8362852197302054,-0.4936436988226656,-0.23862717756676277,
-0.7799500721190704,0.13014944393488248,-0.3446061270452482,1.0,-0.8362852197302054,-0.4936436988226656,-0.23862717756676277,
-0.988853908155836,0.4793104113128239,-0.3347913229419439,1.0,-0.8362852197302054,-0.4936436988226656,-0.23862717756676277,
0.16536154561588567,0.6738840824810794,0.06315353603795915,1.0,0.00033653051580471457,0.1544623299727616,0.98799862113598,
0.04253051173782607,0.7678564706552047,0.048503862111642704,1.0,0.00033653051580471457,0.1544623299727616,0.98799862113598,
-0.27172317294529513,0.5356064382911407,0.0849205496657548,1.0,0.00033653051580471457,0.1544623299727616,0.98799862113598,
0.16536154561588567,0.6738840824810794,0.06315353603795915,1.0,0.20394188408442268,0.405482526503961,0.8910620789911667,
0.17986064630806364,0.8643830950328275,-0.026852532797880246,1.0,0.20394188408442268,0.405482526503961,0.8910620789911667,
0.04253051173782607,0.7678564706552047,0.048503862111642704,1.0,0.20394188408442268,0.405482526503961,0.8910620789911667,
0.42752423632285463,0.4144390550244177,-0.16940315157124086,1.0,0.9417700283305022,-0.16824599457605438,0.29113999905110877,
0.47507048939055463,0.5127229792199752,-0.2664072032766205,1.0,0.9417700283305022,-0.16824599457605438,0.29113999905110877,
0.4610139271060283,0.6326270163270964,-0.15164652749660068,1.0,0.9417700283305022,-0.16824599457605438,0.29113999905110877,
0.3102644121079241,0.18594233596010157,-0.29144459409954915,1.0,0.8932728056529405,-0.4491829143628039,-0.017274377715620817,
0.47507048939055463,0.5127229792199752,-0.2664072032766205,1.0,0.8932728056529405,-0.4491829143628039,-0.017274377715620817,
0.42752423632285463,0.4144390550244177,-0.16940315157124086,1.0,0.8932728056529405,-0.4491829143628039,-0.017274377715620817,
-0.6526973266824034,0.6827697395542114,-0.5967869140841979,1.0,-0.299933442092085,0.3958692857462028,-0.8679443754743649,
-0.8611549517936118,0.7491872258809682,-0.4944577114153792,1.0,-0.299933442092085,0.3958692857462028,-0.8679443754743649,
-0.7666041420493201,0.8761094447061111,-0.46924220347401835,1.0,-0.299933442092085,0.3958692857462028,-0.8679443754743649,
-0.8792861726946457,0.8801400331077489,-0.33021536563129217,1.0,-0.6285995733531361,0.5727934428583974,-0.5260895819142203,
-0.7666041420493201,0.8761094447061111,-0.46924220347401835,1.0,-0.6285995733531361,0.5727934428583974,-0.5260895819142203,
-0.8611549517936118,0.7491872258809682,-0.4944577114153792,1.0,-0.6285995733531361,0.5727934428583974,-0.5260895819142203,
-0.11288310100066945,-0.004233495015934174,0.0007464392643579121,1.0,0.39707513292901103,-0.4742143166818287,0.785781216792177,
0.18563384445601283,0.2031021758750462,-0.024975876148006226,1.0,0.39707513292901103,-0.4742143166818287,0.785781216792177,
0.05080469457963899,0.22043646039051712,0.053617843295497236,1.0,0.39707513292901103,-0.4742143166818287,0.785781216792177,
0.05080469457963899,0.22043646039051712,0.053617843295497236,1.0,0.4457554444906293,-0.3211970060985245,0.8355444733706913,
0.18563384445601283,0.2031021758750462,-0.024975876148006226,1.0,0.4457554444906293,-0.3211970060985245,0.8355444733706913,
0.24522044747794425,0.4706083801349832,0.046068982740083975,1.0,0.4457554444906293,-0.3211970060985245,0.8355444733706913,
0.013273397841110146,-0.062387816054595646,-0.12144006772123017,1.0,0.5501114678547558,-0.576621790303255,0.604056854842452,
0.2181466454762382,0.10207671706279364,-0.1510221994526113,1.0,0.5501114678547558,-0.576621790303255,0.604056854842452,
0.18563384445601283,0.2031021758750462,-0.024975876148006226,1.0,0.5501114678547558,-0.576621790303255,0.604056854842452,
0.013273397841110146,-0.062387816054595646,-0.12144006772123017,1.0,0.63096595701021,-0.750952371634964,0.19481400522039677,
0.0266321817235311,-0.09701047861171486,-0.2981671381261529,1.0,0.63096595701021,-0.750952371634964,0.19481400522039677,
0.2181466454762382,0.10207671706279364,-0.1510221994526113,1.0,0.63096595701021,-0.750952371634964,0.19481400522039677,
-0.02559102289723103,0.9687817615415759,-0.13467398599485303,1.0,-0.41265310457632026,0.7222663276044226,0.5550214115620633,
-0.27416172483475965,0.7429880156559439,-0.02565161944267713,1.0,-0.41265310457632026,0.7222663276044226,0.5550214115620633,
0.002305423115378513,0.9157965094553564,-0.04498191743996127,1.0,-0.41265310457632026,0.7222663276044226,0.5550214115620633,
0.17266985624846787,0.9705757865385691,-0.14766000930983292,1.0,0.02510518513307744,0.8641165262118328,0.5026652552216323,
-0.02559102289723103,0.9687817615415759,-0.13467398599485303,1.0,0.02510518513307744,0.8641165262118328,0.5026652552216323,
0.002305423115378513,0.9157965094553564,-0.04498191743996127,1.0,0.02510518513307744,0.8641165262118328,0.5026652552216323,
	]);
}