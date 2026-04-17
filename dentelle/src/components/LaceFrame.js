// Lace & baroque frame generators — tooth-shaped scallop borders + gilded
// volute scrollwork made of miniature teeth.

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

// ------------------------------------------------------------
// Baroque tooth filigree — a single tooth silhouette used as a motif
// ------------------------------------------------------------
function toothMotif(svgNS, size = 10) {
  const g = document.createElementNS(svgNS, 'g');
  const path = document.createElementNS(svgNS, 'path');
  // stylised incisor: two roots converging, rounded crown
  path.setAttribute(
    'd',
    `M ${-size * 0.5} ${size * 0.9}
     L ${-size * 0.3} ${-size * 0.1}
     Q ${-size * 0.5} ${-size * 0.5} 0 ${-size * 0.7}
     Q ${size * 0.5} ${-size * 0.5} ${size * 0.3} ${-size * 0.1}
     L ${size * 0.5} ${size * 0.9}
     Q ${size * 0.2} ${size * 0.7} 0 ${size * 0.9}
     Q ${-size * 0.2} ${size * 0.7} ${-size * 0.5} ${size * 0.9} Z`
  );
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('opacity', '0.85');
  g.appendChild(path);
  // tiny highlight
  const hl = document.createElementNS(svgNS, 'ellipse');
  hl.setAttribute('cx', -size * 0.15);
  hl.setAttribute('cy', -size * 0.25);
  hl.setAttribute('rx', size * 0.12);
  hl.setAttribute('ry', size * 0.25);
  hl.setAttribute('fill', '#fff7de');
  hl.setAttribute('opacity', '0.35');
  g.appendChild(hl);
  return g;
}

// Baroque volute (C-scroll) with teeth studded along the curve.
function buildVolute(svgNS, { w = 130, h = 130, flip = false } = {}) {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  const g = document.createElementNS(svgNS, 'g');
  if (flip) g.setAttribute('transform', `translate(${w} 0) scale(-1 1)`);

  // main volute curve (C-scroll)
  const scroll = document.createElementNS(svgNS, 'path');
  scroll.setAttribute(
    'd',
    `M 8 ${h - 8}
     Q ${w * 0.1} ${h * 0.45} ${w * 0.45} ${h * 0.3}
     Q ${w * 0.75} ${h * 0.18} ${w * 0.82} ${h * 0.42}
     Q ${w * 0.85} ${h * 0.6} ${w * 0.6} ${h * 0.55}
     Q ${w * 0.45} ${h * 0.52} ${w * 0.5} ${h * 0.4}`
  );
  scroll.setAttribute('stroke', 'currentColor');
  scroll.setAttribute('stroke-width', '1.6');
  scroll.setAttribute('fill', 'none');
  scroll.setAttribute('opacity', '0.9');
  g.appendChild(scroll);

  // secondary flourish
  const flourish = document.createElementNS(svgNS, 'path');
  flourish.setAttribute(
    'd',
    `M 8 ${h - 8}
     Q ${w * 0.22} ${h * 0.8} ${w * 0.48} ${h * 0.78}
     Q ${w * 0.7} ${h * 0.76} ${w * 0.88} ${h * 0.88}`
  );
  flourish.setAttribute('stroke', 'currentColor');
  flourish.setAttribute('stroke-width', '1');
  flourish.setAttribute('fill', 'none');
  flourish.setAttribute('opacity', '0.7');
  g.appendChild(flourish);

  // line of tooth motifs along the main curve
  const teethPositions = [
    { x: w * 0.18, y: h * 0.72, s: 7, r: -40 },
    { x: w * 0.3, y: h * 0.52, s: 8, r: -25 },
    { x: w * 0.46, y: h * 0.34, s: 9, r: -10 },
    { x: w * 0.62, y: h * 0.26, s: 8, r: 10 },
    { x: w * 0.78, y: h * 0.38, s: 7, r: 30 },
    { x: w * 0.68, y: h * 0.5, s: 6, r: 55 },
    { x: w * 0.38, y: h * 0.78, s: 6, r: 15 },
    { x: w * 0.6, y: h * 0.82, s: 5, r: 35 }
  ];
  teethPositions.forEach(({ x, y, s, r }) => {
    const tooth = toothMotif(svgNS, s);
    tooth.setAttribute('transform', `translate(${x} ${y}) rotate(${r})`);
    g.appendChild(tooth);
  });

  // central rosette — larger tooth with sunburst
  const rosette = document.createElementNS(svgNS, 'g');
  rosette.setAttribute('transform', `translate(${w * 0.5} ${h * 0.42})`);
  for (let i = 0; i < 8; i++) {
    const ray = document.createElementNS(svgNS, 'line');
    const a = (i / 8) * Math.PI * 2;
    ray.setAttribute('x1', 0);
    ray.setAttribute('y1', 0);
    ray.setAttribute('x2', Math.cos(a) * 14);
    ray.setAttribute('y2', Math.sin(a) * 14);
    ray.setAttribute('stroke', 'currentColor');
    ray.setAttribute('stroke-width', '0.5');
    ray.setAttribute('opacity', '0.5');
    rosette.appendChild(ray);
  }
  const hub = toothMotif(svgNS, 5);
  rosette.appendChild(hub);
  g.appendChild(rosette);

  svg.appendChild(g);
  return svg;
}

// Horizontal baroque ribbon with a symmetric row of teeth fading out.
function buildHorizRibbon(svgNS, { w = 1000, h = 28, flip = false } = {}) {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  const g = document.createElementNS(svgNS, 'g');
  if (flip) g.setAttribute('transform', `translate(0 ${h}) scale(1 -1)`);

  // graceful wavy spine
  const spine = document.createElementNS(svgNS, 'path');
  let d = `M 0 ${h * 0.6} `;
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i;
    const y = h * (0.55 + Math.sin((i / steps) * Math.PI * 2) * 0.15);
    const cx = x - w / steps / 2;
    const cy = h * (0.55 - Math.sin((i / steps) * Math.PI * 2) * 0.15);
    if (i === 0) d = `M ${x} ${y} `;
    else d += `Q ${cx} ${cy} ${x} ${y} `;
  }
  spine.setAttribute('d', d);
  spine.setAttribute('stroke', 'currentColor');
  spine.setAttribute('stroke-width', '1');
  spine.setAttribute('fill', 'none');
  spine.setAttribute('opacity', '0.85');
  g.appendChild(spine);

  // central medallion
  const medallion = document.createElementNS(svgNS, 'g');
  medallion.setAttribute('transform', `translate(${w / 2} ${h * 0.55})`);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const ray = document.createElementNS(svgNS, 'line');
    ray.setAttribute('x1', 0);
    ray.setAttribute('y1', 0);
    ray.setAttribute('x2', Math.cos(a) * 10);
    ray.setAttribute('y2', Math.sin(a) * 10);
    ray.setAttribute('stroke', 'currentColor');
    ray.setAttribute('stroke-width', '0.5');
    ray.setAttribute('opacity', '0.7');
    medallion.appendChild(ray);
  }
  const hub = toothMotif(svgNS, 6);
  medallion.appendChild(hub);
  g.appendChild(medallion);

  // teeth fading outward from center
  const count = 24;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const side = t < 0.5 ? -1 : 1;
    const norm = Math.abs(t - 0.5) * 2; // 0 at center → 1 at edge
    const x = w / 2 + side * norm * (w / 2 - 40);
    const size = 6 - norm * 4;
    if (size < 1) continue;
    const y = h * (0.55 + Math.sin(norm * Math.PI * 3) * 0.1);
    const tooth = toothMotif(svgNS, size);
    const rotation = side * norm * 40;
    tooth.setAttribute(
      'transform',
      `translate(${x} ${y}) rotate(${rotation})`
    );
    tooth.setAttribute('opacity', `${0.9 - norm * 0.5}`);
    g.appendChild(tooth);
  }

  svg.appendChild(g);
  return svg;
}

// Wrap a content element with a full baroque tooth-lace frame
// (4 corner volutes + top/bottom horizontal ribbons).
export function createBaroqueFrame({ className = '' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = `baroque-wrap ${className}`.trim();

  const svgNS = 'http://www.w3.org/2000/svg';

  // corners
  const corners = [
    { cls: 'tl', style: 'top:-3px;left:-3px;' },
    { cls: 'tr', style: 'top:-3px;right:-3px;transform:scaleX(-1);' },
    { cls: 'bl', style: 'bottom:-3px;left:-3px;transform:scaleY(-1);' },
    {
      cls: 'br',
      style: 'bottom:-3px;right:-3px;transform:scale(-1,-1);'
    }
  ];
  corners.forEach(({ cls, style }) => {
    const c = document.createElement('div');
    c.className = `baroque-corner ${cls}`;
    c.style.cssText = style;
    const svg = buildVolute(svgNS, { w: 130, h: 130 });
    svg.style.width = '100%';
    svg.style.height = '100%';
    c.appendChild(svg);
    wrap.appendChild(c);
  });

  // top ribbon
  const top = document.createElement('div');
  top.className = 'baroque-top';
  const topSvg = buildHorizRibbon(svgNS, { w: 1000, h: 28 });
  topSvg.style.width = '100%';
  topSvg.style.height = '100%';
  top.appendChild(topSvg);
  wrap.appendChild(top);

  // bottom ribbon
  const bot = document.createElement('div');
  bot.className = 'baroque-bottom';
  const botSvg = buildHorizRibbon(svgNS, { w: 1000, h: 28 });
  botSvg.style.width = '100%';
  botSvg.style.height = '100%';
  bot.appendChild(botSvg);
  wrap.appendChild(bot);

  return wrap;
}
