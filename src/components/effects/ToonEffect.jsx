import React, { forwardRef, useMemo } from 'react';
import { Uniform } from 'three';
import { Effect } from 'postprocessing';

const fragmentShader = `
  uniform float thickness;
  uniform float outlineColor;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 size = vec2(thickness) / resolution;

    vec4 n = texture2D(inputBuffer, uv + vec2(0.0, size.y));
    vec4 s = texture2D(inputBuffer, uv - vec2(0.0, size.y));
    vec4 e = texture2D(inputBuffer, uv + vec2(size.x, 0.0));
    vec4 w = texture2D(inputBuffer, uv - vec2(size.x, 0.0));

    float edge = distance(n, s) + distance(e, w);
    edge = smoothstep(0.1, 0.3, edge);

    outputColor = mix(inputColor, vec4(0.0, 0.0, 0.0, 1.0), edge);
  }
`;

class ToonEffectImpl extends Effect {
    constructor({ thickness = 1.0 } = {}) {
        super('ToonEffect', fragmentShader, {
            uniforms: new Map([['thickness', new Uniform(thickness)]]),
        });
    }
}

export const ToonEffect = forwardRef(({ thickness }, ref) => {
    const effect = useMemo(() => new ToonEffectImpl({ thickness }), [thickness]);
    return <primitive ref={ref} object={effect} dispose={null} />;
});
