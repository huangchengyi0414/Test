// SVG placeholder ornaments — pano-X-ray aesthetic, rose-gold monochromatic,
// animated shimmer sweep via CSS. Swap out for AI-generated PNGs later by
// switching imports in LaceFrame.js / PortraitWall.js.

const SVG_NS = 'http://www.w3.org/2000/svg';

// One rose-gold gradient defs block, injected once per document.
function injectDefsOnce() {
  if (document.getElementById('svg-ornament-defs')) return;
  const wrap = document.createElementNS(SVG_NS, 'svg');
  wrap.setAttribute('id', 'svg-ornament-defs');
  wrap.setAttribute('width', 0);
  wrap.setAttribute('height', 0);
  wrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  wrap.innerHTML = `
    <defs>
      <linearGradient id="rg-vert" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8d2d4"/>
        <stop offset="0.35" stop-color="#e8b5b8"/>
        <stop offset="0.7" stop-color="#b76e79"/>
        <stop offset="1" stop-color="#6a3a42"/>
      </linearGradient>
      <linearGradient id="rg-horz" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8c4a52"/>
        <stop offset="0.5" stop-color="#e8b5b8"/>
        <stop offset="1" stop-color="#8c4a52"/>
      </linearGradient>
      <linearGradient id="rg-shimmer" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff0ee" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff0ee" stop-opacity="0.9"/>
        <stop offset="1" stop-color="#fff0ee" stop-opacity="0"/>
        <animate attributeName="x1" values="-1;1" dur="5s" repeatCount="indefinite"/>
        <animate attributeName="x2" values="0;2" dur="5s" repeatCount="indefinite"/>
      </linearGradient>
      <filter id="rg-glow">
        <feGaussianBlur stdDeviation="1.2" result="b"/>
        <feMerge>
          <feMergeNode in="b"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>`;
  document.body.appendChild(wrap);
}

// A single tooth path in a 14×18 local coord, centered at x=7, crown at y=2.
// Shape: rounded-rect root + dome crown, simplified pano-X-ray silhouette.
const TOOTH_PATH =
  'M-5 -9 Q-5 -10 -3.5 -10 L3.5 -10 Q5 -10 5 -9 L5 0 Q5 4 3 6 Q0 7 -3 6 Q-5 4 -5 0 Z';

// A molar variant: wider crown with two cusps hint.
const MOLAR_PATH =
  'M-7 -9 Q-7 -10 -5 -10 L5 -10 Q7 -10 7 -9 L7 1 Q7 5 5 7 Q2.5 8 0 7 Q-2.5 8 -5 7 Q-7 5 -7 1 Z';

// An incisor: narrower, taller.
const INCISOR_PATH =
  'M-3.5 -10 L3.5 -10 L3.5 1 Q3.5 5 2 6.5 Q0 7.5 -2 6.5 Q-3.5 5 -3.5 1 Z';

function toothAt(svg, { x, y, rot = 0, scale = 1, kind = 'canine', delay = 0 }) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute(
    'transform',
    `translate(${x} ${y}) rotate(${rot}) scale(${scale})`
  );
  const path = document.createElementNS(SVG_NS, 'path');
  const d =
    kind === 'molar' ? MOLAR_PATH : kind === 'incisor' ? INCISOR_PATH : TOOTH_PATH;
  path.setAttribute('d', d);
  path.setAttribute('fill', 'url(#rg-vert)');
  path.setAttribute('stroke', '#6a3a42');
  path.setAttribute('stroke-width', '0.4');
  g.appendChild(path);

  // gentle pulsing scale animation
  const anim = document.createElementNS(SVG_NS, 'animateTransform');
  anim.setAttribute('attributeName', 'transform');
  anim.setAttribute('type', 'scale');
  anim.setAttribute('additive', 'sum');
  anim.setAttribute('values', '1;1.04;1');
  anim.setAttribute('dur', '4s');
  anim.setAttribute('begin', `${delay}s`);
  anim.setAttribute('repeatCount', 'indefinite');
  // SMIL additive transform is tricky — skip animateTransform, use CSS on the g
  g.style.transformBox = 'fill-box';
  g.style.transformOrigin = 'center';
  g.style.animation = `ornament-pulse 4s ${delay}s ease-in-out infinite`;

  svg.appendChild(g);
}

// Inject keyframes once
function injectKeyframesOnce() {
  if (document.getElementById('svg-ornament-keyframes')) return;
  const s = document.createElement('style');
  s.id = 'svg-ornament-keyframes';
  s.textContent = `
    @keyframes ornament-pulse {
      0%,100% { transform: scale(1); opacity: 0.92; }
      50%     { transform: scale(1.05); opacity: 1; }
    }
    @keyframes ornament-shimmer-sweep {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .svg-ornament { overflow: visible; }
    .svg-ornament .shimmer-band {
      animation: ornament-shimmer-sweep 5.5s ease-in-out infinite;
      mix-blend-mode: screen;
    }`;
  document.head.appendChild(s);
}

function baseSvg(viewBox, { width, height } = {}) {
  injectDefsOnce();
  injectKeyframesOnce();
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.classList.add('svg-ornament');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  if (width) svg.setAttribute('width', width);
  if (height) svg.setAttribute('height', height);
  return svg;
}

// ---------- Corner (L-shape, top-left orientation, 220×220 viewBox) ----------
// Arc sweeps from upper-right down to lower-left, teeth placed along tangent.
export function svgCorner() {
  const svg = baseSvg('0 0 220 220');
  svg.style.cssText = 'width:100%;height:100%;';

  // Outer frame bracket (two thin lines hugging top + left edges)
  const bracket = document.createElementNS(SVG_NS, 'path');
  bracket.setAttribute(
    'd',
    'M 210 8 L 40 8 Q 8 8 8 40 L 8 210 ' +
      'M 200 18 L 44 18 Q 18 18 18 44 L 18 200'
  );
  bracket.setAttribute('fill', 'none');
  bracket.setAttribute('stroke', 'url(#rg-horz)');
  bracket.setAttribute('stroke-width', '1.4');
  bracket.setAttribute('opacity', '0.75');
  svg.appendChild(bracket);

  // Rivet studs at corner joints
  [
    { x: 18, y: 18 },
    { x: 200, y: 18 },
    { x: 18, y: 200 }
  ].forEach(({ x, y }) => {
    const r = document.createElementNS(SVG_NS, 'circle');
    r.setAttribute('cx', x);
    r.setAttribute('cy', y);
    r.setAttribute('r', 3.2);
    r.setAttribute('fill', 'url(#rg-vert)');
    r.setAttribute('stroke', '#6a3a42');
    r.setAttribute('stroke-width', '0.5');
    svg.appendChild(r);
  });

  // Pano arch centerline (quarter-ellipse from (200,40) down-left to (40,200))
  const arcCenter = { cx: 200, cy: 200, rx: 160, ry: 160 };
  const arcPath = document.createElementNS(SVG_NS, 'path');
  arcPath.setAttribute(
    'd',
    `M 40 200 A ${arcCenter.rx} ${arcCenter.ry} 0 0 1 200 40`
  );
  arcPath.setAttribute('fill', 'none');
  arcPath.setAttribute('stroke', 'url(#rg-vert)');
  arcPath.setAttribute('stroke-width', '1');
  arcPath.setAttribute('opacity', '0.4');
  arcPath.setAttribute('stroke-dasharray', '2 3');
  svg.appendChild(arcPath);

  // Place 6 teeth along the arc from angle 180° → 90° (quarter circle)
  const teeth = [
    { ang: 178, kind: 'molar', scale: 2.2 },
    { ang: 160, kind: 'molar', scale: 2.0 },
    { ang: 140, kind: 'canine', scale: 1.9 },
    { ang: 120, kind: 'canine', scale: 1.75 },
    { ang: 103, kind: 'incisor', scale: 1.65 },
    { ang: 92, kind: 'incisor', scale: 1.55 }
  ];
  teeth.forEach((t, i) => {
    const rad = (t.ang * Math.PI) / 180;
    const x = arcCenter.cx + Math.cos(rad) * arcCenter.rx;
    const y = arcCenter.cy + Math.sin(rad) * arcCenter.ry;
    // Tooth "root" points outward (away from arc center), crown inward
    const tangentDeg = t.ang - 90; // rotate so tooth aligns along radial
    toothAt(svg, {
      x,
      y,
      rot: tangentDeg + 90,
      scale: t.scale,
      kind: t.kind,
      delay: i * 0.25
    });
  });

  // Shimmer band overlay (moving highlight strip)
  const shimmer = document.createElementNS(SVG_NS, 'rect');
  shimmer.setAttribute('x', -60);
  shimmer.setAttribute('y', 0);
  shimmer.setAttribute('width', 60);
  shimmer.setAttribute('height', 220);
  shimmer.setAttribute('fill', 'url(#rg-shimmer)');
  shimmer.classList.add('shimmer-band');
  svg.appendChild(shimmer);

  return svg;
}

// ---------- Ribbon (horizontal pano arch, 1024×128 viewBox) ----------
export function svgRibbon() {
  const svg = baseSvg('0 0 1024 128');
  svg.style.cssText = 'width:100%;height:100%;';

  // Top + bottom thin rails
  [32, 96].forEach((y) => {
    const rail = document.createElementNS(SVG_NS, 'line');
    rail.setAttribute('x1', 40);
    rail.setAttribute('y1', y);
    rail.setAttribute('x2', 984);
    rail.setAttribute('y2', y);
    rail.setAttribute('stroke', 'url(#rg-horz)');
    rail.setAttribute('stroke-width', '1.2');
    rail.setAttribute('opacity', '0.65');
    svg.appendChild(rail);
  });

  // Center crest studs
  [472, 552].forEach((x) => {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', 64);
    c.setAttribute('r', 3);
    c.setAttribute('fill', 'url(#rg-vert)');
    svg.appendChild(c);
  });

  // Pano arch — shallow curve spanning full width, crown-down (teeth hang below)
  const archPath = document.createElementNS(SVG_NS, 'path');
  archPath.setAttribute('d', 'M 50 50 Q 512 110 974 50');
  archPath.setAttribute('fill', 'none');
  archPath.setAttribute('stroke', 'url(#rg-horz)');
  archPath.setAttribute('stroke-width', '1');
  archPath.setAttribute('opacity', '0.5');
  archPath.setAttribute('stroke-dasharray', '3 4');
  svg.appendChild(archPath);

  // 14 teeth along the arch (sampled via Bezier formula)
  const N = 14;
  // Bezier: P0=(50,50), P1=(512,110), P2=(974,50)
  const bez = (t) => ({
    x: (1 - t) ** 2 * 50 + 2 * (1 - t) * t * 512 + t ** 2 * 974,
    y: (1 - t) ** 2 * 50 + 2 * (1 - t) * t * 110 + t ** 2 * 50,
    // tangent direction
    dx: 2 * (1 - t) * (512 - 50) + 2 * t * (974 - 512),
    dy: 2 * (1 - t) * (110 - 50) + 2 * t * (50 - 110)
  });
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const { x, y, dx, dy } = bez(t);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    // Alternate kinds: molars at ends, incisors in center
    const distCenter = Math.abs(i - (N - 1) / 2);
    const kind =
      distCenter > 4.5 ? 'molar' : distCenter > 2 ? 'canine' : 'incisor';
    toothAt(svg, {
      x,
      y,
      rot: ang,
      scale: 1.9,
      kind,
      delay: i * 0.15
    });
  }

  // Shimmer band
  const shimmer = document.createElementNS(SVG_NS, 'rect');
  shimmer.setAttribute('x', -200);
  shimmer.setAttribute('y', 0);
  shimmer.setAttribute('width', 200);
  shimmer.setAttribute('height', 128);
  shimmer.setAttribute('fill', 'url(#rg-shimmer)');
  shimmer.classList.add('shimmer-band');
  svg.appendChild(shimmer);

  return svg;
}

// ---------- Portrait frame (1024×1366 viewBox, centered cutout) ----------
export function svgPortraitFrame() {
  const svg = baseSvg('0 0 1024 1366');
  svg.style.cssText =
    'position:absolute;inset:-2%;width:104%;height:104%;pointer-events:none;z-index:2;';

  // Corner rivet studs
  const corners = [
    [32, 32],
    [992, 32],
    [32, 1334],
    [992, 1334]
  ];
  corners.forEach(([x, y]) => {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', 5);
    c.setAttribute('fill', 'url(#rg-vert)');
    svg.appendChild(c);
  });

  // Side rails (L/R)
  [40, 984].forEach((x) => {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', 120);
    line.setAttribute('x2', x);
    line.setAttribute('y2', 1246);
    line.setAttribute('stroke', 'url(#rg-vert)');
    line.setAttribute('stroke-width', '1.2');
    line.setAttribute('opacity', '0.6');
    svg.appendChild(line);
  });

  // Top arch — maxilla pano curve; teeth hang downward
  const topArchCurve = 'M 60 60 Q 512 180 964 60';
  const topPath = document.createElementNS(SVG_NS, 'path');
  topPath.setAttribute('d', topArchCurve);
  topPath.setAttribute('fill', 'none');
  topPath.setAttribute('stroke', 'url(#rg-horz)');
  topPath.setAttribute('stroke-width', '0.8');
  topPath.setAttribute('opacity', '0.4');
  topPath.setAttribute('stroke-dasharray', '3 4');
  svg.appendChild(topPath);

  const bez = (p0, p1, p2, t) => ({
    x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x,
    y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y,
    dx: 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
    dy: 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
  });

  const topArch = {
    p0: { x: 60, y: 60 },
    p1: { x: 512, y: 180 },
    p2: { x: 964, y: 60 }
  };
  const bottomArch = {
    p0: { x: 60, y: 1306 },
    p1: { x: 512, y: 1186 },
    p2: { x: 964, y: 1306 }
  };

  const N = 12;
  [topArch, bottomArch].forEach((arch, archIdx) => {
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N;
      const { x, y, dx, dy } = bez(arch.p0, arch.p1, arch.p2, t);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI + (archIdx === 0 ? 90 : -90);
      const distCenter = Math.abs(i - (N - 1) / 2);
      const kind =
        distCenter > 3.8 ? 'molar' : distCenter > 1.8 ? 'canine' : 'incisor';
      toothAt(svg, {
        x,
        y,
        rot: ang,
        scale: 2.4,
        kind,
        delay: (archIdx * N + i) * 0.12
      });
    }
  });

  const bottomPath = document.createElementNS(SVG_NS, 'path');
  bottomPath.setAttribute('d', 'M 60 1306 Q 512 1186 964 1306');
  bottomPath.setAttribute('fill', 'none');
  bottomPath.setAttribute('stroke', 'url(#rg-horz)');
  bottomPath.setAttribute('stroke-width', '0.8');
  bottomPath.setAttribute('opacity', '0.4');
  bottomPath.setAttribute('stroke-dasharray', '3 4');
  svg.appendChild(bottomPath);

  return svg;
}

// ---------- DENTELLE title (rose-gold metallic letters + shimmer) ----------
// Simple text element styled with rose-gold gradient, plus ornament flourishes.
export function svgTitle(text = 'DENTELLE') {
  const svg = baseSvg('0 0 1600 420');
  svg.style.cssText = 'width:100%;height:auto;display:block;';

  // Flanking flourishes (small arc of 3 teeth each side)
  [100, 1500].forEach((cx, idx) => {
    for (let i = 0; i < 3; i++) {
      const x = cx + (idx === 0 ? i * 26 : -i * 26);
      const y = 210;
      toothAt(svg, {
        x,
        y,
        rot: idx === 0 ? -90 : 90,
        scale: 2.0,
        kind: i === 1 ? 'canine' : 'incisor',
        delay: i * 0.2
      });
    }
  });

  const t = document.createElementNS(SVG_NS, 'text');
  t.setAttribute('x', 800);
  t.setAttribute('y', 260);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('font-family', "'Cinzel Decorative', 'Cinzel', serif");
  t.setAttribute('font-weight', '900');
  t.setAttribute('font-size', 200);
  t.setAttribute('letter-spacing', '8');
  t.setAttribute('fill', 'url(#rg-vert)');
  t.setAttribute('stroke', '#4a2830');
  t.setAttribute('stroke-width', '1.2');
  t.textContent = text;
  svg.appendChild(t);

  // Shimmer band sweeping over text
  const shimmer = document.createElementNS(SVG_NS, 'rect');
  shimmer.setAttribute('x', -400);
  shimmer.setAttribute('y', 100);
  shimmer.setAttribute('width', 400);
  shimmer.setAttribute('height', 220);
  shimmer.setAttribute('fill', 'url(#rg-shimmer)');
  shimmer.classList.add('shimmer-band');
  svg.appendChild(shimmer);

  return svg;
}
