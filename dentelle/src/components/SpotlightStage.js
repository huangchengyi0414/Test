// Wraps a scene's inner content with the jewelry-style spotlight overlay.
export function createSpotlight() {
  const el = document.createElement('div');
  el.className = 'spotlight';
  return el;
}
