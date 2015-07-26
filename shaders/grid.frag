
uniform sampler2D tNoise;
uniform sampler2D tMatcap;

varying vec3 e;
varying vec3 n;
varying vec2 vuv;

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
   return a + b*cos( 6.28318*(c*t+d) );
}

void main() {

   vec3 color = vec3( 1.0 );

   // vec3 r = reflect( e, n );
   // float m = 2.0 * sqrt( pow( r.x, 2.0 ) + pow( r.y, 2.0 ) + pow( r.z + 1.0, 2.0 ) );
   // vec2 vN = r.xy / m + 0.5;

   // vec2 vN = n.xy * 0.5 + 0.5;

   // color = texture2D( tMatcap, vN ).rgb;

   // s-curve
   // color = smoothstep( vec3( -0.1 ), vec3( 0.9 ), color );

   // color.g *= texture2D( tNoise, vuv ).r;

   if ( n.y != 0.0 ) color = vec3( 1.0, 0.0, 0.0 );
   if ( n.x != 0.0 ) color = vec3( 0.0 );
   if ( n.z != 0.0 ) color = vec3( 0.1 );

   // float height = texture2D( tNoise, vuv ).r;
   // color = pal( height, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(2.0,1.0,0.0),vec3(0.5,0.20,0.25) );

   gl_FragColor = vec4( color, 1.0 );

}
