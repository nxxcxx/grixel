'use strict';

window.addEventListener( 'keypress', event => {

	switch( event.keyCode ) {

		case 65:/*A*/
		case 97:/*a*/ SCENE_SETTINGS.enableGridHelper ^= 1; updateHelpers();
		break;

		case 83 :/*S*/
		case 115:/*s*/ SCENE_SETTINGS.enableAxisHelper ^= 1; updateHelpers();
		break;

	}

} );

window.addEventListener( 'resize', debounce( onWindowResize, 50 ) );

function onWindowResize() {

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	PIXEL_RATIO = window.devicePixelRatio || 1;
	SCREEN_RATIO = WIDTH/HEIGHT;

	CAMERA.aspect = SCREEN_RATIO;
	CAMERA.updateProjectionMatrix();

	RENDERER.setSize( WIDTH, HEIGHT );
	RENDERER.setPixelRatio( PIXEL_RATIO );

}
