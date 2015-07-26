'use strict';

function update() {

	uniformsInput.time.value = CLOCK.getElapsedTime();

	FBOC.step();
	grid.material.uniforms.tNoise.value = FBOC.getPass( 'noisePass' ).getRenderTarget();

	updateGuiDisplay();

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	RENDERER.clear();
	update();
	RENDERER.render( SCENE, CAMERA );

	hud.setInputTexture( FBOC.getPass( 'noisePass' ).getRenderTarget() );
	hud.render();

	STATS.update();

};
