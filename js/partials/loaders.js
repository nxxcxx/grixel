'use strict';

var LOADING_MANAGER = new THREE.LoadingManager();
LOADING_MANAGER.onLoad = () => {

	main();
	run();

};

LOADING_MANAGER.onProgress = ( item, loaded, total ) => {

	console.log( loaded + '/' + total, item );

};

var SHADERS = {};
var SHADER_LOADER = new THREE.XHRLoader( LOADING_MANAGER );
SHADER_LOADER.setResponseType( 'text' );
SHADER_LOADER.showStatus = true;

SHADER_LOADER.loadAll = ( SHADERS, urlObj ) => {

	Object.keys( urlObj ).forEach( ( key ) => {

		SHADER_LOADER.load( urlObj[ key ], ( shader ) => {

			SHADERS[ key ] = shader;

		} );

	} );

};

SHADER_LOADER.loadAll( SHADERS, {

	gridVert: './shaders/grid.vert',
	gridFrag: './shaders/grid.frag',
	hudVert: './shaders/hud.vert',
	hudFrag: './shaders/hud.frag',
	passVert: './shaders/pass.vert',
	passFrag: './shaders/pass.frag',
	noiseFrag: './shaders/noise.frag',

} );

var TEXTURES = {};
var TEXTURE_LOADER = new THREE.TextureLoader( LOADING_MANAGER );
TEXTURE_LOADER.load( './textures/mc_skymetal.jpg', ( tex ) => {
	TEXTURES.matcap = tex;
} );
