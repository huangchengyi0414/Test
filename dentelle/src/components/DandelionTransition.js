import gsap from 'gsap';

// Dandelion seed = a thin stem topped with radial fluffy filaments (SVG <g>).
function buildSeedSVG() {
  const ns = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(ns, 'g');

  const stem = document.createElementNS(ns, 'line');
  stem.setAttribute('x1', 0);
  stem.setAttribute('y1', 0);
  stem.setAttribute('x2', 0);
  stem.setAttribute('y2', 14);
  stem.setAttribute('stroke', '#e8d5b7');
  stem.setAttribute('stroke-width', '0.6');
  stem.setAttribute('opacity', '0.7');
  g.appendChild(stem);

  const filaments = 9;
  for (let i = 0; i < filaments; i++) {
    const angle = (Math.PI / (filaments - 1)) * i - Math.PI / 2;
    const len = 6 + Math.random() * 2;
    const x = Math.cos(angle) * len;
    const y = Math.sin(angle) * len;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', x);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#f8ecd1');
    line.setAttribute('stroke-width', '0.4');
    line.setAttribute('opacity', 0.55 + Math.random() * 0.35);
    g.appendChild(line);

    const tip = document.createElementNS(ns, 'circle');
    tip.setAttribute('cx', x);
    tip.setAttribute('cy', y);
    tip.setAttribute('r', 0.6);
    tip.setAttribute('fill', '#f8ecd1');
    tip.setAttribute('opacity', 0.8);
    g.appendChild(tip);
  }

  const core = document.createElementNS(ns, 'circle');
  core.setAttribute('r', 1.2);
  core.setAttribute('fill', '#e8c889');
  g.appendChild(core);

  return g;
}

function ensureOverlay() {
  let overlay = document.getElementById('dandelion-overlay');
  if (!overlay) {
    overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.id = 'dandelion-overlay';
    overlay.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    overlay.setAttribute('preserveAspectRatio', 'none');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '100';
    document.body.appendChild(overlay);
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  overlay.setAttribute('viewBox', `0 0 ${w} ${h}`);
  overlay.setAttribute('width', w);
  overlay.setAttribute('height', h);
  return overlay;
}

// Plays a ~1.4s dandelion blow-across transition. Returns a promise.
export function dandelionBlow({ duration = 1.4, count = 55 } = {}) {
  return new Promise((resolve) => {
    const overlay = ensureOverlay();
    overlay.innerHTML = '';
    gsap.set(overlay, { opacity: 1 });

    const w = window.innerWidth;
    const h = window.innerHeight;

    let remaining = count;
    const done = () => {
      remaining--;
      if (remaining <= 0) {
        overlay.innerHTML = '';
        gsap.set(overlay, { opacity: 0 });
        resolve();
      }
    };

    for (let i = 0; i < count; i++) {
      const seed = buildSeedSVG();
      const startX = -80 + Math.random() * 120;
      const startY = h * (0.2 + Math.random() * 0.7);
      const endX = w + 80 + Math.random() * 120;
      const endY = startY + (Math.random() - 0.5) * h * 0.5;
      const scale = 0.55 + Math.random() * 1.3;
      const rotate = (Math.random() - 0.5) * 240;
      const delay = Math.random() * (duration * 0.4);
      const dur = duration * (0.7 + Math.random() * 0.5);

      // GSAP handles SVG x/y/rotation/scale via the transform attribute natively
      gsap.set(seed, { x: startX, y: startY, rotation: 0, scale, opacity: 0 });
      overlay.appendChild(seed);

      gsap.to(seed, {
        x: endX,
        y: endY,
        rotation: rotate,
        duration: dur,
        delay,
        ease: 'sine.inOut'
      });
      gsap.to(seed, {
        opacity: 0.95,
        duration: 0.3,
        delay,
        ease: 'power1.out'
      });
      gsap.to(seed, {
        opacity: 0,
        duration: 0.4,
        delay: delay + dur - 0.3,
        ease: 'power1.in',
        onComplete: done
      });
    }
  });
}
