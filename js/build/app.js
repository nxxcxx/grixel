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

	Avert: './shaders/shaderA.vert',
	Afrag: './shaders/shaderA.frag'

});

// var TEXTURES = {};
// var TEXTURE_LOADER = new THREE.TextureLoader( LOADING_MANAGER );
// TEXTURE_LOADER.load( '', ( tex ) => {
// 	TEXTURES.name = tex;
// } );

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

// ---- Settings
var SCENE_SETTINGS = {

	bgColor: 2368557,
	enableGridHelper: true,
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

//source: main.js
function main() {

   initGui();
}

//source: run.js
function update() {}

// ----  draw loop
function run() {

	requestAnimationFrame(run);
	RENDERER.clear();
	update();
	RENDERER.render(SCENE, CAMERA);
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