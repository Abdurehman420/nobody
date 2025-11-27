precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity; // New uniform

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    
    float t = u_time * 0.2;
    
    // Domain warping for base noise (used for void purple)
    vec2 q = vec2(0.);
    q.x = snoise(st + vec2(0.0, t));
    q.y = snoise(st + vec2(5.2, 1.3));

    // Chromatic Aberration
    float aberration = 0.02 * (1.0 + sin(u_time * 0.5));
    
    // Cap visual noise density so it doesn't get too chaotic/heavy
    float intensityMod = 1.0 + min(u_intensity, 2.0) * 0.5;
    
    // Color shift based on intensity (Green -> Purple)
    vec3 baseColorLow = vec3(0.0, 1.0, 0.0); // Neon Green
    vec3 baseColorHigh = vec3(0.8, 0.0, 1.0); // Neon Purple
    
    // Use smoothstep for better control. 
    // 0.0 to 0.5: Pure Green
    // 0.5 to 3.5: Gradient to Purple
    float colorMix = smoothstep(0.5, 3.5, u_intensity);
    vec3 targetColor = mix(baseColorLow, baseColorHigh, colorMix);
    
    vec3 color = vec3(0.0);
    
    // Red channel
    vec2 stR = st + vec2(aberration, 0.0);
    vec2 qR = vec2(snoise(stR + vec2(0.0, t)), snoise(stR + vec2(5.2, 1.3)));
    vec2 rR = vec2(snoise(stR + 1.0*qR + vec2(1.7, 9.2) + 0.15*t), snoise(stR + 1.0*qR + vec2(8.3, 2.8) + 0.126*t));
    float fR = snoise(stR + rR);
    color.r = mix(vec3(0.0, 0.05, 0.0), targetColor, clamp(fR*fR*4.0 * intensityMod, 0.0, 1.0)).r;

    // Green channel (Center)
    vec2 stG = st;
    vec2 qG = vec2(snoise(stG + vec2(0.0, t)), snoise(stG + vec2(5.2, 1.3)));
    vec2 rG = vec2(snoise(stG + 1.0*qG + vec2(1.7, 9.2) + 0.15*t), snoise(stG + 1.0*qG + vec2(8.3, 2.8) + 0.126*t));
    float fG = snoise(stG + rG);
    color.g = mix(vec3(0.0, 0.05, 0.0), targetColor, clamp(fG*fG*4.0 * intensityMod, 0.0, 1.0)).g;

    // Blue channel
    vec2 stB = st - vec2(aberration, 0.0);
    vec2 qB = vec2(snoise(stB + vec2(0.0, t)), snoise(stB + vec2(5.2, 1.3)));
    vec2 rB = vec2(snoise(stB + 1.0*qB + vec2(1.7, 9.2) + 0.15*t), snoise(stB + 1.0*qB + vec2(8.3, 2.8) + 0.126*t));
    float fB = snoise(stB + rB);
    color.b = mix(vec3(0.0, 0.05, 0.0), targetColor, clamp(fB*fB*4.0 * intensityMod, 0.0, 1.0)).b;
    
    // Add some "void" purple (Only at high intensity)
    // ROOT CAUSE FIX: Disabled void purple entirely to prove green background
    // float voidMix = clamp((u_intensity - 2.0) / 3.0, 0.0, 1.0);
    // color = mix(color, vec3(0.1, 0.0, 0.2), clamp(length(q) * voidMix, 0.0, 1.0));

    gl_FragColor = vec4(color, 1.0);
}
