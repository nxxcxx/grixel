'use strict';

if ( !Detector.webgl ){
	Detector.addGetWebGLMessage();
}

var CANVAS, STATS;
var SCENE, CAMERA, CAMERA_CTRL, RENDERER;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var PIXEL_RATIO = window.devicePixelRatio || 1;
var SCREEN_RATIO = WIDTH/HEIGHT;

// ---- Settings
	var SCENE_SETTINGS = {

		bgColor: 0x24242d,
		enableGridHelper: true,
		enableAxisHelper: true

	};

// ---- Scene
	CANVAS = document.getElementById( 'canvas-container' );
	SCENE = new THREE.Scene();

// ---- Camera
	CAMERA = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 10, 100000 );
	// CAMERA orbit control
	CAMERA_CTRL = new THREE.OrbitControls( CAMERA, CANVAS );
	CAMERA_CTRL.object.position.z = 600;
	CAMERA_CTRL.update();

// ---- Renderer
	RENDERER = new THREE.WebGLRenderer( { antialias: true , alpha: true } );
	RENDERER.setSize( WIDTH, HEIGHT );
	RENDERER.setPixelRatio( PIXEL_RATIO );
	RENDERER.setClearColor( SCENE_SETTINGS.bgColor, 1 );
	RENDERER.autoClear = false;
	CANVAS.appendChild( RENDERER.domElement );

// ---- Stats
	STATS = new Stats();
	CANVAS.appendChild( STATS.domElement );

// ---- grid & axis helper
	var gridHelper = new THREE.GridHelper( 600, 50 );
	gridHelper.setColors( 0x00bbff, 0xffffff );
	gridHelper.material.opacity = 0.1;
	gridHelper.material.transparent = true;
	gridHelper.position.y = -300;
	SCENE.add( gridHelper );

	var axisHelper = new THREE.AxisHelper( 50 );
	SCENE.add( axisHelper );

	function updateHelpers() {
		gridHelper.visible = !!SCENE_SETTINGS.enableGridHelper;
		axisHelper.visible = !!SCENE_SETTINGS.enableAxisHelper;
	}
