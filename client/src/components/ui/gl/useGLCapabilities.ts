import React from 'react';

export function useGLCapabilities() {
  const [reduced, setReduced] = React.useState(false);
  const [supportsWebGL, setSupportsWebGL] = React.useState(false);

  React.useEffect(() => {
    const reduce = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reduce);
    const hasWebGL = typeof window !== 'undefined' && (('WebGL2RenderingContext' in window) || ('WebGLRenderingContext' in window));
    setSupportsWebGL(!!hasWebGL);
  }, []);

  const enabled = !reduced && supportsWebGL;
  return { reduced, supportsWebGL, enabled };
}


