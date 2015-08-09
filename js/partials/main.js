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

   CAMERA.position.set( -354.9, 241.9, 374.6 );
   CAMERA.rotation.set( -0.573, -0.672, -0.382 );

   // window.grid2 = createVoxelGrid();
   // grid2.rotateZ( Math.PI * 0.5 );
   // grid2.position.set( 256, 256, 0 );
   // SCENE.add( grid2 );
   //
   // window.grid3 = createVoxelGrid();
   // grid3.rotateX( Math.PI * 0.5 );
   // grid3.position.set( 0, 256, -256 );
   // SCENE.add( grid3 );

   window.hud = new HUD( RENDERER );

}
