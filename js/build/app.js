"use strict"
//source: loaders.js
var LOADING_MANAGER = new THREE.LoadingManager();
LOADING_MANAGER.onLoad = function () {

	main();
	run();
};

LOADING_MANAGER.onProgress = function (item, loaded, total) {

	console.log(loaded + '/' + total, item);
};

var SHADERS = {};
var SHADER_LOADER = new THREE.XHRLoader(LOADING_MANAGER);
SHADER_LOADER.setResponseType('text');
SHADER_LOADER.showStatus = true;

SHADER_LOADER.loadAll = function (SHADERS, urlObj) {

	Object.keys(urlObj).forEach(function (key) {

		SHADER_LOADER.load(urlObj[key], function (shader) {

			SHADERS[key] = shader;
		});
	});
};

SHADER_LOADER.loadAll(SHADERS, {

	gridVert: './shaders/grid.vert',
	gridFrag: './shaders/grid.frag',
	hudVert: './shaders/hud.vert',
	hudFrag: './shaders/hud.frag',
	passVert: './shaders/pass.vert',
	passFrag: './shaders/pass.frag',
	noiseFrag: './shaders/noise.frag'

});

var TEXTURES = {};
var TEXTURE_LOADER = new THREE.TextureLoader(LOADING_MANAGER);
TEXTURE_LOADER.load('./textures/mc_red.jpg', function (tex) {
	TEXTURES.matcap = tex;
});

//source: scene.js
if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}

var CANVAS, STATS;
var SCENE, CAMERA, CAMERA_CTRL, RENDERER;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var PIXEL_RATIO = window.devicePixelRatio || 1;
var SCREEN_RATIO = WIDTH / HEIGHT;
var CLOCK = new THREE.Clock();

// ---- Settings
var SCENE_SETTINGS = {

	bgColor: 2368557,
	enableGridHelper: false,
	enableAxisHelper: true

};

// ---- Scene
CANVAS = document.getElementById('canvas-container');
SCENE = new THREE.Scene();

// ---- Camera
CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 100000);
// CAMERA orbit control
CAMERA_CTRL = new THREE.OrbitControls(CAMERA, CANVAS);
CAMERA_CTRL.object.position.z = 600;
CAMERA_CTRL.update();

// ---- Renderer
RENDERER = new THREE.WebGLRenderer({ antialias: true, alpha: true });
RENDERER.setSize(WIDTH, HEIGHT);
RENDERER.setPixelRatio(PIXEL_RATIO);
RENDERER.setClearColor(SCENE_SETTINGS.bgColor, 1);
RENDERER.autoClear = false;
CANVAS.appendChild(RENDERER.domElement);

// ---- Stats
STATS = new Stats();
CANVAS.appendChild(STATS.domElement);

// ---- grid & axis helper
var gridHelper = new THREE.GridHelper(600, 50);
gridHelper.setColors(48127, 16777215);
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
gridHelper.position.y = -300;
SCENE.add(gridHelper);

var axisHelper = new THREE.AxisHelper(50);
SCENE.add(axisHelper);

function updateHelpers() {
	gridHelper.visible = !!SCENE_SETTINGS.enableGridHelper;
	axisHelper.visible = !!SCENE_SETTINGS.enableAxisHelper;
}
updateHelpers();

//source: gui.js
var gui, gui_display, gui_settings;

function initGui() {

	// gui_settings.add( Object, property, min, max, step ).name( 'name' );

	gui = new dat.GUI();
	gui.width = 300;

	gui_display = gui.addFolder('Display');
	gui_display.autoListen = false;

	gui_settings = gui.addFolder('Settings');

	gui_settings.addColor(SCENE_SETTINGS, 'bgColor').name('Background');
	gui_settings.add(CAMERA, 'fov', 25, 120, 1).name('FOV');

	gui_display.open();
	gui_settings.open();

	gui_settings.__controllers.forEach(function (controller) {
		controller.onChange(updateSettings);
	});
}

function updateSettings() {

	CAMERA.updateProjectionMatrix();
	RENDERER.setClearColor(SCENE_SETTINGS.bgColor, 1);
}

function updateGuiDisplay() {

	gui_display.__controllers.forEach(function (controller) {
		controller.updateDisplay();
	});
}

//source: FBOCompositor.js
function FBOCompositor(renderer, bufferSize, passThruVertexShader) {

	this.renderer = renderer;

	this._getWebGLExtensions();
	this.bufferSize = bufferSize;
	this.passThruVertexShader = passThruVertexShader;
	var halfBufferSize = bufferSize * 0.5;
	this.camera = new THREE.OrthographicCamera(-halfBufferSize, halfBufferSize, halfBufferSize, -halfBufferSize, 1, 10);
	this.camera.position.z = 5;
	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene = new THREE.Scene();
	this.scene.add(this.quad);
	this.dummyRenderTarget = new THREE.WebGLRenderTarget(2, 2);

	this.passThruShader = new THREE.ShaderMaterial({

		uniforms: {
			resolution: {
				type: 'v2',
				value: new THREE.Vector2(this.bufferSize, this.bufferSize)
			},
			passTexture: {
				type: 't',
				value: null
			}
		},
		vertexShader: SHADERS.passVert,
		fragmentShader: SHADERS.passFrag

	});

	this.passes = [];
}

FBOCompositor.prototype = {

	_getWebGLExtensions: function _getWebGLExtensions() {

		var gl = this.renderer.getContext();
		if (!gl.getExtension('OES_texture_float')) {
			console.error('No support for float textures!');
		}

		if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
			console.error('No support for vertex shader textures!');
		}
	},

	getPass: function getPass(name) {
		/* todo: update to ECMA6 Array.find() */
		var pass = null;
		this.passes.some(function (currPass) {

			var test = currPass.name === name;
			if (test) pass = currPass;
			return test;
		});

		return pass;
	},

	addPass: function addPass(name, fragmentSahader, inputTargets) {

		var pass = new FBOPass(name, this.passThruVertexShader, fragmentSahader, this.bufferSize);
		pass.inputTargetList = inputTargets || {};
		this.passes.push(pass);
		return pass;
	},

	updatePassDependencies: function updatePassDependencies() {

		var self = this;
		this.passes.forEach(function (currPass) {

			Object.keys(currPass.inputTargetList).forEach(function bindTarget(shaderInputName) {

				var targetPass = currPass.inputTargetList[shaderInputName];
				currPass.setInputTarget(shaderInputName, self.getPass(targetPass).getRenderTarget());
			});
		});
	},

	_renderPass: function _renderPass(shader, passTarget) {

		this.quad.material = shader;
		this.renderer.render(this.scene, this.camera, passTarget, true);
	},

	renderInitialBuffer: function renderInitialBuffer(dataTexture, toPass) {

		var pass = this.getPass(toPass);
		this.passThruShader.uniforms.passTexture.value = dataTexture;
		this._renderPass(this.passThruShader, pass.doubleBuffer[1]); // render to secondary buffer which is already set as input to first buffer.
		this._renderPass(this.passThruShader, pass.doubleBuffer[0]); // or just render to both
		/*!
   *	dont call renderer.clear() before updating the simulation it will clear current active buffer which is the render target that we previously rendered to.
   *	or just set active target to dummy target.
   */
		this.renderer.setRenderTarget(this.dummyRenderTarget);
	},

	step: function step() {

		for (var i = 0; i < this.passes.length; i++) {

			this.updatePassDependencies();
			var currPass = this.passes[i];
			this._renderPass(currPass.getShader(), currPass.getRenderTarget());
			currPass.swapBuffer();
		}
	}

};

function FBOPass(name, vertexShader, fragmentSahader, bufferSize) {

	this.name = name;
	this.vertexShader = vertexShader;
	this.fragmentSahader = fragmentSahader;
	this.bufferSize = bufferSize;

	this.currentBuffer = 0;
	this.doubleBuffer = []; //  single FBO cannot act as input (texture) and output (render target) at the same time, we take the double-buffer approach
	this.doubleBuffer[0] = this.generateRenderTarget();
	this.doubleBuffer[1] = this.generateRenderTarget();

	this.inputTargetList = {};

	this.uniforms = {
		resolution: {
			type: 'v2',
			value: new THREE.Vector2(this.bufferSize, this.bufferSize)
		},
		mirrorBuffer: {
			type: 't',
			value: this.doubleBuffer[1]
		}
	};

	this.shader = new THREE.ShaderMaterial({

		uniforms: this.uniforms,
		vertexShader: this.vertexShader,
		fragmentShader: this.fragmentSahader

	});
}

FBOPass.prototype = {

	getShader: function getShader() {
		return this.shader;
	},
	getRenderTarget: function getRenderTarget() {
		return this.doubleBuffer[this.currentBuffer];
	},
	setInputTarget: function setInputTarget(shaderInputName, inputTarget) {
		this.uniforms[shaderInputName] = {
			type: 't',
			value: inputTarget
		};
	},
	swapBuffer: function swapBuffer() {

		this.uniforms.mirrorBuffer.value = this.doubleBuffer[this.currentBuffer];
		this.currentBuffer ^= 1; // toggle between 0 and 1
	},
	generateRenderTarget: function generateRenderTarget() {

		var target = new THREE.WebGLRenderTarget(this.bufferSize, this.bufferSize, {

			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false

		});

		return target;
	},
	attachUniform: function attachUniform(uniformsInput) {

		var self = this;
		Object.keys(uniformsInput).forEach(function (key) {

			self.uniforms[key] = uniformsInput[key];
		});
	}

};

//source: hud.js
function HUD(renderer) {

	this.renderer = renderer;
	this.HUDMargin = 0.05;
	var hudHeight = 2 / 4; // 2.0 = full screen size
	var hudWidth = hudHeight;

	this.HUDCam = new THREE.OrthographicCamera(-SCREEN_RATIO, SCREEN_RATIO, 1, -1, 1, 10);
	this.HUDCam.position.z = 5;

	this.hudMaterial = new THREE.ShaderMaterial({

		uniforms: {
			tDiffuse: {
				type: "t",
				value: this.tTarget
			}
		},
		vertexShader: SHADERS.hudVert,
		fragmentShader: SHADERS.hudFrag,
		depthWrite: false,
		depthTest: false,
		side: THREE.DoubleSide

	});

	this.hudGeo = new THREE.PlaneBufferGeometry(hudWidth, hudHeight);
	this.hudGeo.applyMatrix(new THREE.Matrix4().makeScale(1, -1, 1)); // flipY
	this.hudGeo.applyMatrix(new THREE.Matrix4().makeTranslation(hudWidth / 2, hudHeight / 2, 0));

	this.HUDMesh = new THREE.Mesh(this.hudGeo, this.hudMaterial);
	this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
	this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

	this.HUDScene = new THREE.Scene();
	this.HUDScene.add(this.HUDMesh);
}

HUD.prototype = {

	setInputTexture: function setInputTexture(target) {

		this.hudMaterial.uniforms.tDiffuse.value = target;
	},

	render: function render() {

		this.renderer.clearDepth();
		this.renderer.render(this.HUDScene, this.HUDCam);
	},

	update: function update() {
		// call on window resize

		// match aspect ratio to prevent distortion
		this.HUDCam.left = -SCREEN_RATIO;
		this.HUDCam.right = SCREEN_RATIO;

		this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
		this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

		this.HUDCam.updateProjectionMatrix();
	}

};

//source: grid.js
function createGrid() {

   var gridSize = 512;
   var gridResolution = 64;

   var halfGridSize = gridSize * 0.5;
   var cellSize = gridSize / gridResolution;
   var cellCenter = cellSize * 0.5;
   var voxelSize = cellSize * 0.85;

   var gridGeom = new THREE.BufferGeometry();

   var final = [];
   var normals = [];
   var topQuad = [];
   var centroid = [];
   var here = [];

   function computeVoxelVertices() {

      var s = voxelSize * 0.5;
      var vertices = [];

      vertices.push([s, -s, s]);
      vertices.push([-s, -s, s]);
      vertices.push([-s, -s, -s]);
      vertices.push([s, -s, -s]);

      vertices.push([s, s, s]);
      vertices.push([-s, s, s]);
      vertices.push([-s, s, -s]);
      vertices.push([s, s, -s]);

      return vertices;
   }

   function constructVoxel() {

      for (var r = 0; r < gridResolution; r++) {

         for (var c = 0; c < gridResolution; c++) {

            var rp = -halfGridSize + (r + 1) * cellSize;
            var cp = -halfGridSize + (c + 1) * cellSize;

            var vv = computeVoxelVertices();

            // quad idx
            [3, 2, 1, 1, 0, 3, // -y
            4, 5, 6, 6, 7, 4, // +y
            0, 1, 5, 5, 4, 0, // +z
            2, 3, 7, 7, 6, 2, // -z
            3, 0, 4, 4, 7, 3, // +x
            1, 2, 6, 6, 5, 1 // -x
            ].forEach(function (qidx, idx) {
               final.push(vv[qidx][0] + rp);
               final.push(vv[qidx][1]);
               final.push(vv[qidx][2] + cp);

               // flag topQuad to displace in shader
               if (qidx === 4 || qidx === 5 || qidx === 6 || qidx === 7) topQuad.push(1);else topQuad.push(-1);

               centroid.push(rp, cp);
               here.push((r + 0.5) / gridResolution, (c + 0.5) / gridResolution);
            });

            // -y +y
            normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
            normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
            // +z -z
            normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
            normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);
            // +x -x
            normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0);normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0);
            normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0);normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0);
         }
      }
   }

   constructVoxel();

   var buffVerts = new Float32Array(final);
   var buffNorms = new Float32Array(normals);
   var buffTopQuad = new Float32Array(topQuad);
   var buffCentroid = new Float32Array(centroid);
   var buffHere = new Float32Array(here);
   console.log('buffVerts:', buffVerts.length);
   console.log('buffNorms:', buffNorms.length);

   gridGeom.addAttribute('position', new THREE.BufferAttribute(buffVerts, 3));
   gridGeom.addAttribute('normal', new THREE.BufferAttribute(buffNorms, 3));
   gridGeom.addAttribute('topQuad', new THREE.BufferAttribute(buffTopQuad, 1));
   gridGeom.addAttribute('centroid', new THREE.BufferAttribute(buffCentroid, 2));
   gridGeom.addAttribute('here', new THREE.BufferAttribute(buffHere, 2));

   var gridShader = new THREE.ShaderMaterial({

      uniforms: {
         tMatcap: { type: 't', value: TEXTURES.matcap },
         tNoise: { type: 't', value: null }
      },
      attributes: { // need to specify custom attributes .addAttribute above won't do
         topQuad: { type: 'f', value: null },
         centroid: { type: 'v2', value: null },
         here: { type: 'v2', value: null }
      },
      vertexShader: SHADERS.gridVert,
      fragmentShader: SHADERS.gridFrag,
      side: THREE.BackSide
   });

   // var gridMesh = new THREE.PointCloud( gridGeom, new THREE.PointCloudMaterial( { size: 1 } ) );
   // var gridMesh = new THREE.Mesh( gridGeom, new THREE.MeshBasicMaterial() );
   // var gridMesh = new THREE.Mesh( gridGeom, new THREE.MeshBasicMaterial({ wireframe: true }) );
   var gridMesh = new THREE.Mesh(gridGeom, gridShader);

   return gridMesh;
}
// side: THREE.DoubleSide,
// transparent: true,
// depthTest: false,
// depthWrite: false,
// blending: THREE.AdditiveBlending

//source: main.js
function main() {

  initGui();

  window.uniformsInput = {
    time: { type: 'f', value: 0 }
  };

  var fboSize = 512;
  window.FBOC = new FBOCompositor(RENDERER, fboSize, SHADERS.passVert);
  FBOC.addPass('noisePass', SHADERS.noiseFrag, null);
  FBOC.getPass('noisePass').attachUniform(uniformsInput);

  window.grid = createGrid();
  SCENE.add(grid);

  // window.grid2 = createGrid();
  // grid2.rotateZ( Math.PI * 0.5 );
  // grid2.position.set( 256, 256, 0 );
  // SCENE.add( grid2 );
  //
  // window.grid3 = createGrid();
  // grid3.rotateX( Math.PI * 0.5 );
  // grid3.position.set( 0, 256, -256 );
  // SCENE.add( grid3 );

  window.hud = new HUD(RENDERER);
}

//source: run.js
function update() {

	uniformsInput.time.value = CLOCK.getElapsedTime();

	FBOC.step();
	grid.material.uniforms.tNoise.value = FBOC.getPass('noisePass').getRenderTarget();

	updateGuiDisplay();
}

// ----  draw loop
function run() {

	requestAnimationFrame(run);
	RENDERER.clear();
	update();
	RENDERER.render(SCENE, CAMERA);

	hud.setInputTexture(FBOC.getPass('noisePass').getRenderTarget());
	hud.render();

	STATS.update();
};

//source: events.js
window.addEventListener('keypress', function (event) {

	switch (event.keyCode) {

		case 65: /*A*/
		case 97:
			/*a*/SCENE_SETTINGS.enableGridHelper ^= 1;updateHelpers();
			break;

		case 83: /*S*/
		case 115:
			/*s*/SCENE_SETTINGS.enableAxisHelper ^= 1;updateHelpers();
			break;

	}
});

window.addEventListener('resize', debounce(onWindowResize, 50));

function onWindowResize() {

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	PIXEL_RATIO = window.devicePixelRatio || 1;
	SCREEN_RATIO = WIDTH / HEIGHT;

	CAMERA.aspect = SCREEN_RATIO;
	CAMERA.updateProjectionMatrix();

	RENDERER.setSize(WIDTH, HEIGHT);
	RENDERER.setPixelRatio(PIXEL_RATIO);

	hud.update();
}

//source: util.js
function debounce(func, wait, immediate) {
	var _this = this,
	    _arguments = arguments;

	var timeout;
	return function () {

		var context = _this,
		    args = _arguments;
		var later = function later() {

			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

//# sourceMappingURL=app.js.map