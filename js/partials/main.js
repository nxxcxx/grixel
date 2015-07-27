'use strict';

function main() {

   initGui();

   window.uniformsInput = {
		time: { type: 'f', value: 0.0 }
	};

   var fboSize = 512;
	window.FBOC = new FBOCompositor( RENDERER, fboSize, SHADERS.passVert );
	FBOC.addPass( 'noisePass', SHADERS.noiseFrag, null );
   FBOC.getPass( 'noisePass' ).attachUniform( uniformsInput );

   window.grid = createVoxelGrid();
   SCENE.add( grid );

   // window.grid2 = createGrid();
   // grid2.rotateZ( Math.PI * 0.5 );
   // grid2.position.set( 256, 256, 0 );
   // SCENE.add( grid2 );
   //
   // window.grid3 = createGrid();
   // grid3.rotateX( Math.PI * 0.5 );
   // grid3.position.set( 0, 256, -256 );
   // SCENE.add( grid3 );

   window.hud = new HUD( RENDERER );

}
