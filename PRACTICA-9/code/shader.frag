// Author: Tycho Quintana Santana
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
const float scale = 16.0;
vec3 shader(vec2 _index, vec2 _st,float th){
  float left = step(th,_st.x);
  float bottom = step(th,_st.y);
  float right = step(th,1.0-_st.x);
  float top = step(th,1.0-_st.y);  
  const float limit = 2.0*(scale - 1.0);
  for (float i = 0.0; i <= limit; i++) {
      if ((_index.x + _index.y) == i) {
        float t = u_time + float(_index.x - _index.y) / scale; 
        float r = 0.5 + 0.5 * sin(5.0 * t);
        float g = 0.5 + 0.5 * sin(5.0 * t + 2.0);
        float b = 0.5 + 0.5 * sin(5.0 * t + 4.0);
        return vec3(r, g, b);   
    }
  }
     return vec3(0.0,0.0,0.0);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution;
  vec3 color = vec3(0.0);
  vec2 index = floor(st*scale);
  st = fract(st*scale);
  color = vec3(shader(index, st,0.1));
  gl_FragColor = vec4(color,1.0);
}