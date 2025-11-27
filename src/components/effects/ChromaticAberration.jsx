import React, { forwardRef, useMemo } from 'react';
import { Uniform } from 'three';
import { Effect } from 'postprocessing';

const fragmentShader = `
  uniform float offset;
  
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 dir = uv - 0.5;
    float d = .5 * length(dir);
    normalize(dir);
    vec2 value = d * dir * offset;

    vec4 c1 = texture2D(inputBuffer, uv - value);
    vec4 c2 = texture2D(inputBuffer, uv);
    vec4 c3 = texture2D(inputBuffer, uv + value);

    outputColor = vec4(c1.r, c2.g, c3.b, c1.a + c2.a + c3.b);
  }
`;

class ChromaticAberrationEffectImpl extends Effect {
    constructor({ offset = 0.05 } = {}) {
        super('ChromaticAberrationEffect', fragmentShader, {
            uniforms: new Map([['offset', new Uniform(offset)]]),
        });
    }
}

export const ChromaticAberrationEffect = forwardRef(({ offset }, ref) => {
    const effect = useMemo(() => new ChromaticAberrationEffectImpl({ offset }), [offset]);
    return <primitive ref={ref} object={effect} dispose={null} />;
});
