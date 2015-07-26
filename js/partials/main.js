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

   window.grid = createGrid();
   SCENE.add( grid );

   window.hud = new HUD( RENDERER );

   // // test mapcap shader
   // var sph = new THREE.SphereGeometry( 250, 64, 64 );
   // var sphShader = new THREE.ShaderMaterial( {
   //
	// 	uniforms: {
	// 		tMatcap: { type: 't', value: TEXTURES.matcap },
	// 	},
	// 	vertexShader: SHADERS.matcapVert,
	// 	fragmentShader: SHADERS.matcapFrag
   //
	// } );
   // window.sphMesh = new THREE.Mesh( sph, sphShader );
   // SCENE.add( sphMesh );

}
