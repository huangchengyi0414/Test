// PortraitWall — renders a teacher + N student portraits with Harry Potter oil-painting vibe.
// A silhouette SVG is generated procedurally per name (stable hash), so no real photos are needed yet.

import { svgPortraitFrame } from './SvgOrnaments.js';

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function personSVG(name, seedOffset = 0, isTeacher = false) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 140');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.classList.add('person-svg');

  const h = hashStr(name) + seedOffset;
  const shirtHue = (h % 50) + 20; // amber-ish
  const skin = ['#d8b48b', '#c69b77', '#b38967', '#d4a684'][h % 4];
  const bgTop = isTeacher ? '#3a2a1a' : '#2a1d11';
  const bgBottom = '#0a0604';

  // Background gradient
  const defs = document.createElementNS(svgNS, 'defs');
  const grad = document.createElementNS(svgNS, 'radialGradient');
  grad.setAttribute('id', `bg-${h}`);
  grad.setAttribute('cx', '50%');
  grad.setAttribute('cy', '40%');
  grad.setAttribute('r', '70%');
  grad.innerHTML = `
    <stop offset="0%" stop-color="${bgTop}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${bgBottom}" stop-opacity="1"/>`;
  defs.appendChild(grad);
  svg.appendChild(defs);

  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', 100);
  bg.setAttribute('height', 140);
  bg.setAttribute('fill', `url(#bg-${h})`);
  svg.appendChild(bg);

  // Shoulders / coat
  const coat = document.createElementNS(svgNS, 'path');
  coat.setAttribute(
    'd',
    'M10 140 Q 10 95 30 85 Q 50 95 70 85 Q 90 95 90 140 Z'
  );
  coat.setAttribute('fill', isTeacher ? '#f0e4c8' : '#ede3cb');
  coat.setAttribute('opacity', '0.85');
  svg.appendChild(coat);

  // Inner collar
  const collar = document.createElementNS(svgNS, 'path');
  collar.setAttribute('d', 'M40 90 L50 110 L60 90 Z');
  collar.setAttribute('fill', '#1a130a');
  svg.appendChild(collar);

  // Neck
  const neck = document.createElementNS(svgNS, 'rect');
  neck.setAttribute('x', 44);
  neck.setAttribute('y', 76);
  neck.setAttribute('width', 12);
  neck.setAttribute('height', 14);
  neck.setAttribute('fill', skin);
  svg.appendChild(neck);

  // Head
  const head = document.createElementNS(svgNS, 'ellipse');
  head.setAttribute('cx', 50);
  head.setAttribute('cy', 55);
  head.setAttribute('rx', 16);
  head.setAttribute('ry', 20);
  head.setAttribute('fill', skin);
  svg.appendChild(head);

  // Hair
  const hairStyle = h % 4;
  const hair = document.createElementNS(svgNS, 'path');
  const hairColor = ['#1a120a', '#3a2410', '#2a1808', '#4a2e14'][h % 4];
  let hairD;
  if (hairStyle === 0) {
    hairD = 'M34 48 Q 36 30 50 30 Q 64 30 66 48 Q 66 40 58 36 Q 50 34 42 36 Q 34 40 34 48 Z';
  } else if (hairStyle === 1) {
    hairD = 'M32 54 Q 30 30 50 28 Q 70 30 68 54 Q 68 44 60 42 L 60 52 L 56 46 L 50 52 L 44 46 L 40 52 L 40 42 Q 32 44 32 54 Z';
  } else if (hairStyle === 2) {
    hairD = 'M33 52 Q 34 34 50 32 Q 66 34 67 52 Q 67 40 63 40 L 63 70 Q 63 58 60 50 L 40 50 Q 37 58 37 70 L 37 40 Q 33 40 33 52 Z';
  } else {
    hairD = 'M34 46 Q 38 28 50 30 Q 62 28 66 46 Q 60 40 50 40 Q 40 40 34 46 Z';
  }
  hair.setAttribute('d', hairD);
  hair.setAttribute('fill', hairColor);
  svg.appendChild(hair);

  // Eyes (tiny dots)
  [43, 57].forEach((x) => {
    const e = document.createElementNS(svgNS, 'circle');
    e.setAttribute('cx', x);
    e.setAttribute('cy', 56);
    e.setAttribute('r', 1.1);
    e.setAttribute('fill', '#1a0f05');
    svg.appendChild(e);
  });

  // Subtle oil-paint brush strokes
  for (let i = 0; i < 7; i++) {
    const stroke = document.createElementNS(svgNS, 'path');
    const x = (h * (i + 1)) % 100;
    const y = ((h >> i) * 7) % 140;
    stroke.setAttribute(
      'd',
      `M${x} ${y} Q ${x + 8} ${y + 2} ${x + 18} ${y - 1}`
    );
    stroke.setAttribute('stroke', 'rgba(248,236,209,0.06)');
    stroke.setAttribute('stroke-width', 1.5);
    stroke.setAttribute('fill', 'none');
    svg.appendChild(stroke);
  }

  // Top rim light
  const rim = document.createElementNS(svgNS, 'ellipse');
  rim.setAttribute('cx', 50);
  rim.setAttribute('cy', 42);
  rim.setAttribute('rx', 14);
  rim.setAttribute('ry', 4);
  rim.setAttribute('fill', 'rgba(248,236,209,0.18)');
  svg.appendChild(rim);

  return svg;
}

function ornament() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('frame-ornament');
  svg.setAttribute('viewBox', '0 0 100 140');
  svg.setAttribute('preserveAspectRatio', 'none');
  // inner gilded bevel
  const inner = document.createElementNS(svgNS, 'rect');
  inner.setAttribute('x', 2);
  inner.setAttribute('y', 2);
  inner.setAttribute('width', 96);
  inner.setAttribute('height', 136);
  inner.setAttribute('fill', 'none');
  inner.setAttribute('stroke', 'rgba(232,213,183,0.55)');
  inner.setAttribute('stroke-width', 0.6);
  svg.appendChild(inner);
  // corner flourishes
  const corners = [
    [4, 4, 0],
    [96, 4, 90],
    [96, 136, 180],
    [4, 136, 270]
  ];
  corners.forEach(([cx, cy, rot]) => {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${rot})`);
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute(
      'd',
      'M0 0 Q 8 2 12 8 M0 0 Q 2 8 8 12 M0 0 Q 5 5 10 4 Q 4 5 5 10'
    );
    p.setAttribute('stroke', '#b76e79');
    p.setAttribute('stroke-width', 0.5);
    p.setAttribute('fill', 'none');
    p.setAttribute('opacity', 0.75);
    g.appendChild(p);
    svg.appendChild(g);
  });
  return svg;
}

export function createPortrait({ name, role, isTeacher = false }) {
  const el = document.createElement('div');
  el.className = `portrait ${isTeacher ? 'teacher' : 'student'}`;
  el.appendChild(personSVG(name, isTeacher ? 999 : 0, isTeacher));
  el.appendChild(ornament());
  const frame = svgPortraitFrame();
  frame.classList.add('frame-ornament');
  el.appendChild(frame);

  const nameEl = document.createElement('div');
  nameEl.className = 'name';
  nameEl.textContent = name;
  el.appendChild(nameEl);

  if (role) {
    const roleEl = document.createElement('div');
    roleEl.className = 'role';
    roleEl.textContent = role;
    el.appendChild(roleEl);
  }
  return el;
}

export function createPortraitWall({ teacher, students }) {
  const wall = document.createElement('div');
  wall.className = 'portrait-wall';
  wall.style.setProperty('--cols', String(students.length));

  let teacherEl = null;
  if (teacher) {
    teacherEl = createPortrait({
      name: teacher.name,
      role: teacher.role,
      isTeacher: true
    });
    wall.appendChild(teacherEl);
  }

  const studentEls = students.map((s) =>
    createPortrait({ name: s.name, role: s.latin, isTeacher: false })
  );
  studentEls.forEach((el) => wall.appendChild(el));

  return { wall, teacherEl, studentEls };
}
