// Ornate frame — uses AI-generated PNG ornaments placed at
// public/ornaments/corner.png  (1024×1024 black bg, top-left quadrant used)
// public/ornaments/ribbon.png  (wide horizontal, black bg)
//
// Black background is removed at display time via CSS mix-blend-mode: screen.

const CORNER_URL = 'ornaments/corner.png';
const RIBBON_URL = 'ornaments/ribbon.png';

function cornerImg(styleExtra = '') {
  const img = document.createElement('img');
  img.src = CORNER_URL;
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.style.cssText = `
    position:absolute;
    width: clamp(110px, 14vw, 220px);
    height: auto;
    mix-blend-mode: screen;
    pointer-events: none;
    z-index: 2;
    ${styleExtra}
  `;
  // Graceful fallback if the file isn't present yet
  img.onerror = () => {
    img.style.display = 'none';
  };
  return img;
}

function ribbonDiv(styleExtra = '') {
  const div = document.createElement('div');
  div.style.cssText = `
    position:absolute;
    height: clamp(28px, 3.2vw, 52px);
    background: url(${RIBBON_URL}) center center / 100% 100% no-repeat;
    mix-blend-mode: screen;
    pointer-events: none;
    z-index: 1;
    ${styleExtra}
  `;
  return div;
}

// ---------- Public API ----------

// A generic ornate wrapper: 4 mirrored corners + top/bottom ribbons.
// Use this for speech boxes / oath frame / Dentelle intro etc.
export function createBaroqueFrame({ className = '' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = `baroque-wrap ${className}`.trim();

  // corners — top-left as-is, others mirrored
  wrap.appendChild(cornerImg('top:-6px;left:-6px;'));
  wrap.appendChild(
    cornerImg('top:-6px;right:-6px;transform:scaleX(-1);')
  );
  wrap.appendChild(
    cornerImg('bottom:-6px;left:-6px;transform:scaleY(-1);')
  );
  wrap.appendChild(
    cornerImg('bottom:-6px;right:-6px;transform:scale(-1,-1);')
  );

  // top ribbon — sits between the two top corners
  wrap.appendChild(
    ribbonDiv(
      'top: clamp(6px, 0.8vw, 14px); left: clamp(130px, 16vw, 230px); right: clamp(130px, 16vw, 230px);'
    )
  );
  // bottom ribbon — mirrored Y
  wrap.appendChild(
    ribbonDiv(
      'bottom: clamp(6px, 0.8vw, 14px); left: clamp(130px, 16vw, 230px); right: clamp(130px, 16vw, 230px); transform: scaleY(-1);'
    )
  );

  return wrap;
}

// Simple lace frame alias — used by hall-notes etc. Uses the same ornament set.
export function createLaceFrame({ className = '', sides = true } = {}) {
  const wrap = document.createElement('div');
  wrap.className = `lace-frame ${className}`.trim();

  wrap.appendChild(cornerImg('top:-6px;left:-6px;'));
  wrap.appendChild(
    cornerImg('top:-6px;right:-6px;transform:scaleX(-1);')
  );
  wrap.appendChild(
    cornerImg('bottom:-6px;left:-6px;transform:scaleY(-1);')
  );
  wrap.appendChild(
    cornerImg('bottom:-6px;right:-6px;transform:scale(-1,-1);')
  );
  wrap.appendChild(
    ribbonDiv(
      'top: clamp(6px, 0.8vw, 14px); left: clamp(130px, 16vw, 230px); right: clamp(130px, 16vw, 230px);'
    )
  );
  wrap.appendChild(
    ribbonDiv(
      'bottom: clamp(6px, 0.8vw, 14px); left: clamp(130px, 16vw, 230px); right: clamp(130px, 16vw, 230px); transform: scaleY(-1);'
    )
  );

  // `sides` param kept for API backward compatibility but no longer used
  void sides;
  return wrap;
}

// Standalone scallop ribbon (kept for room headers etc.)
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
