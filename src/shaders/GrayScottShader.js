export const SimulationShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uFeed;
    uniform float uKill;
  uniform float uDelta;
  uniform vec2 uScale;
  uniform float uTime;
  varying vec2 vUv;

  // Pseudo-random
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

    void main() {
    vec2 uv = vUv;
      vec2 pixel = 1.0 / uResolution;

      // Laplacian
      vec4 center = texture2D(uTexture, uv);
      vec4 top = texture2D(uTexture, uv + vec2(0.0, pixel.y));
      vec4 bottom = texture2D(uTexture, uv - vec2(0.0, pixel.y));
      vec4 left = texture2D(uTexture, uv - vec2(pixel.x, 0.0));
      vec4 right = texture2D(uTexture, uv + vec2(pixel.x, 0.0));

      vec4 laplacian = top + bottom + left + right - 4.0 * center;

      float a = center.r;
      float b = center.g;

// Initialize with noise if empty (or just add noise continuously at low level)
if (uTime < 0.1) {
  if (hash(uv) > 0.99) b = 1.0;
  a = 1.0;
}

      // Gray-Scott
      // dA/dt = Da * LapA - A * B^2 + f * (1 - A)
      // dB/dt = Db * LapB + A * B^2 - (k + f) * B
      
      float da = 1.0; // Diffusion A
      float db = 0.5; // Diffusion B

      float reaction = a * b * b;
      
      float nextA = a + (da * laplacian.r - reaction + uFeed * (1.0 - a)) * uDelta;
      float nextB = b + (db * laplacian.g + reaction - (uKill + uFeed) * b) * uDelta;

gl_FragColor = vec4(clamp(nextA, 0.0, 1.0), clamp(nextB, 0.0, 1.0), 0.0, 1.0);
    }
`
};

export const RenderShader = {
  vertexShader: `
    varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;

`
};
