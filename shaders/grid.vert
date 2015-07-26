
uniform sampler2D tNoise;

attribute float topQuad;
attribute vec2 centroid;
attribute vec2 here;

varying vec3 e;
varying vec3 n;
varying vec2 vuv;

void main() {

   e = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );
   // n = normalize( vec3( modelViewMatrix * vec4( normal, 0.0 ) ) );
   n = normal;

   // vec2 uv = position.xz / ( 512.0 * 0.5 ) * 0.5 + 0.5;
   vec2 uv = here.xy;
   vuv = uv;

   vec3 newPosition = position;
   if ( topQuad > 0.0 ) {
      newPosition.y += texture2D( tNoise, uv ).r * 80.0;
   }

   // scale xz
   vec2 diff = position.xz - centroid;
   float len = length( diff ) + 1.0;
   // float len = length( diff ) + ( 1.0 - texture2D( tNoise, uv ).r ) * 1.0;
   diff = normalize( diff );
   newPosition.xz = centroid + diff * len * ( 1.1 - texture2D( tNoise, uv ).r );

   gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
