#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform float u_time;
const float s=16.;
vec3 f(vec2 i,vec2 p){
for(float k=0.;k<=30.;k++)if(i.x+i.y==k){
float u=u_time+(i.x-i.y)/s;
return vec3(.5+.5*sin(5.*u),.5+.5*sin(5.*u+2.),.5+.5*sin(5.*u+4.));
}
return vec3(0);
}
void main(){
vec2 p=gl_FragCoord.xy/u_resolution,i=floor(p*s);
p=fract(p*s);
gl_FragColor=vec4(f(i,p),1);
}
