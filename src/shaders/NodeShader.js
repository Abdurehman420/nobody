export const NodeShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uTime;
    uniform float uSeed;

    // Pseudo-random
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv - 0.5;
      float d = length(uv) * 2.0;
      
      // Wobble effect
      float angle = atan(uv.y, uv.x);
      float wobble = sin(angle * 5.0 + uTime * 2.0 + uSeed * 10.0) * 0.05;
      float radius = 0.8 + wobble;

      // Mushroom Cap (Circle with wobble)
      float cap = smoothstep(radius, radius - 0.05, d);
      
      // Black Outline
      float outline = smoothstep(radius + 0.1, radius, d) - cap;
      
      // Spots (Alien warts)
      vec2 spotUV = uv * 3.0 + vec2(uSeed, uSeed);
      float spotD = length(fract(spotUV) - 0.5);
      float spots = smoothstep(0.3, 0.2, spotD);
      
      // Color mixing
      vec3 baseColor = uColor;
      vec3 spotColor = vec3(0.8, 1.0, 0.0); // Toxic yellow spots
      if (uColor.r > 0.5) spotColor = vec3(0.0, 1.0, 1.0); // Cyan spots for red/magenta nodes
      
      vec3 finalColor = mix(baseColor, spotColor, spots * 0.5);
      
      // Add rim lighting
      float rim = smoothstep(0.6, 0.8, d);
      finalColor += rim * 0.5;

      // Final composition: Outline (Black) + Cap (Color)
      vec4 color = vec4(0.0, 0.0, 0.0, outline); // Black outline
      color = mix(color, vec4(finalColor, 1.0), cap); // Cap on top
      
      // Cutout
      if (color.a < 0.1) discard;

      gl_FragColor = color;
    }
  `
};
