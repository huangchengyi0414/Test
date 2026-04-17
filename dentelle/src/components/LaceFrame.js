// LaceFrame — a DOM wrapper that adds scalloped tooth-edge lace borders.
// Usage: const frame = createLaceFrame({ className: 'hero' }); frame.appendChild(child);
export function createLaceFrame({ className = '', sides = true } = {}) {
  const wrap = document.createElement('div');
  wrap.className = `lace-frame ${className}`.trim();
  if (sides) {
    const left = document.createElement('span');
    left.className = 'lace-side left';
    const right = document.createElement('span');
    right.className = 'lace-side right';
    wrap.appendChild(left);
    wrap.appendChild(right);
  }
  return wrap;
}

// Standalone scalloped SVG border ribbon (used as ornament)
export function createScallopRibbon(width = 280) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} 18`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', 18);
  svg.style.display = 'block';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let d = 'M0 9 ';
  const step = 20;
  for (let x = 0; x < width; x += step) {
    d += `Q${x + step / 2} 0 ${x + step} 9 `;
  }
  path.setAttribute('d', d);
  path.setAttribute('stroke', '#c9a96e');
  path.setAttribute('stroke-width', '1');
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', '0.7');
  svg.appendChild(path);

  return svg;
}
