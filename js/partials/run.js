'use strict';

function update() {

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	RENDERER.clear();
	update();
	RENDERER.render( SCENE, CAMERA );
	STATS.update();

};
