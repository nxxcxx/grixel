uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {

	vec3 color = texture2D( tDiffuse, vUv ).rgb;
	gl_FragColor = vec4( color, 1.0 );

}
