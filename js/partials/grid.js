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

      vertices.push( [  s, -s,  s ] );
      vertices.push( [ -s, -s,  s ] );
      vertices.push( [ -s, -s, -s ] );
      vertices.push( [  s, -s, -s ] );

      vertices.push( [  s,  s,  s ] );
      vertices.push( [ -s,  s,  s ] );
      vertices.push( [ -s,  s, -s ] );
      vertices.push( [  s,  s, -s ] );

      return vertices;

   }

   function constructVoxel() {

      for ( var r = 0; r < gridResolution; r ++ ) {

         for ( var c = 0; c < gridResolution; c ++ ) {

            var rp = -halfGridSize + ( r + 1 ) * cellSize;
            var cp = -halfGridSize + ( c + 1 ) * cellSize;

            var vv = computeVoxelVertices();

            // quad idx
            [  3, 2, 1, 1, 0, 3, // -y
               4, 5, 6, 6, 7, 4, // +y
               0, 1, 5, 5, 4, 0, // +z
               2, 3, 7, 7, 6, 2, // -z
               3, 0, 4, 4, 7, 3, // +x
               1, 2, 6, 6, 5, 1  // -x
            ].forEach( ( qidx, idx ) => {
               final.push( vv[ qidx ][ 0 ] + rp );
               final.push( vv[ qidx ][ 1 ] );
               final.push( vv[ qidx ][ 2 ] + cp );

               // flag topQuad to displace in shader
               if ( qidx === 4 || qidx === 5 || qidx === 6 || qidx === 7 ) topQuad.push( 1.0 );
               else topQuad.push( -1.0 );

               centroid.push( rp, cp );
               here.push( ( r + 0.5 ) / gridResolution, ( c + 0.5 ) / gridResolution );

            } );

            // -y +y
            normals.push( 0, -1, 0, 0, -1, 0, 0, -1, 0 );normals.push( 0, -1, 0, 0, -1, 0, 0, -1, 0 );
            normals.push( 0,  1, 0, 0,  1, 0, 0,  1, 0 );normals.push( 0,  1, 0, 0,  1, 0, 0,  1, 0 );
            // +z -z
            normals.push( 0, 0,  1, 0, 0,  1, 0, 0,  1 );normals.push( 0, 0,  1, 0, 0,  1, 0, 0,  1 );
            normals.push( 0, 0, -1, 0, 0, -1, 0, 0, -1 );normals.push( 0, 0, -1, 0, 0, -1, 0, 0, -1 );
            // +x -x
            normals.push(  1, 0, 0,  1, 0, 0,  1, 0, 0 );normals.push(  1, 0, 0,  1, 0, 0,  1, 0, 0 );
            normals.push( -1, 0, 0, -1, 0, 0, -1, 0, 0 );normals.push( -1, 0, 0, -1, 0, 0, -1, 0, 0 );

         }

      }

   }

   constructVoxel();

   var buffVerts = new Float32Array( final );
   var buffNorms = new Float32Array( normals );
   var buffTopQuad = new Float32Array( topQuad );
   var buffCentroid = new Float32Array( centroid );
   var buffHere = new Float32Array( here );
   console.log( 'buffVerts:', buffVerts.length );
   console.log( 'buffNorms:', buffNorms.length );

	gridGeom.addAttribute( 'position', new THREE.BufferAttribute( buffVerts, 3 ) );
	gridGeom.addAttribute( 'normal'  , new THREE.BufferAttribute( buffNorms, 3 ) );
	gridGeom.addAttribute( 'topQuad'  , new THREE.BufferAttribute( buffTopQuad, 1 ) );
   gridGeom.addAttribute( 'centroid'  , new THREE.BufferAttribute( buffCentroid, 2 ) );
   gridGeom.addAttribute( 'here'  , new THREE.BufferAttribute( buffHere, 2 ) );

	var gridShader = new THREE.ShaderMaterial( {

		uniforms: {
			tMatcap: { type: 't', value: TEXTURES.matcap },
         tNoise:  { type: 't', value: null },
		},
		attributes: { // need to specify custom attributes .addAttribute above won't do
			topQuad: { type: 'f', value: null },
         centroid: { type: 'v2', value: null },
         here: { type: 'v2', value: null }
		},
		vertexShader: SHADERS.gridVert,
		fragmentShader: SHADERS.gridFrag,
      side: THREE.BackSide,
      // side: THREE.DoubleSide,
      // transparent: true,
      // depthTest: false,
      // depthWrite: false,
      // blending: THREE.AdditiveBlending

	} );

   // var gridMesh = new THREE.PointCloud( gridGeom, new THREE.PointCloudMaterial( { size: 1 } ) );
   // var gridMesh = new THREE.Mesh( gridGeom, new THREE.MeshBasicMaterial() );
   // var gridMesh = new THREE.Mesh( gridGeom, new THREE.MeshBasicMaterial({ wireframe: true }) );
   var gridMesh = new THREE.Mesh( gridGeom, gridShader );

	return gridMesh;

}
