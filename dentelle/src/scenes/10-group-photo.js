import gsap from 'gsap';
import { createLaceFrame } from '../components/LaceFrame.js';
import { groupPhoto } from '../data/ceremony.js';

export function groupPhotoScene() {
  function mount(node, { setHUD }) {
    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    node.appendChild(mist);

    const wrap = document.createElement('div');
    wrap.style.cssText =
      'display:flex;flex-direction:column;align-items:center;gap:4vh;width:min(80vw,1000px);';

    const label = document.createElement('div');
    label.innerHTML = `
      <div class="overline" style="text-align:center;">${groupPhoto.overline}</div>
      <div class="rule"></div>
      <h2 class="title-han" style="text-align:center;">${groupPhoto.title}</h2>
    `;
    wrap.appendChild(label);

    // Placeholder photo — stylised class tableau
    const frame = createLaceFrame();
    frame.style.cssText = 'width:100%;padding:clamp(20px,2.4vw,40px);';

    const photo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    photo.setAttribute('viewBox', '0 0 900 460');
    photo.setAttribute('width', '100%');
    photo.style.display = 'block';
    photo.innerHTML = `
      <defs>
        <radialGradient id="gp-bg" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#3a2a18" stop-opacity="1"/>
          <stop offset="100%" stop-color="#0a0604" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="900" height="460" fill="url(#gp-bg)"/>
      <!-- floor -->
      <path d="M0 380 L900 380 L900 460 L0 460 Z" fill="#1a1108" opacity="0.7"/>
      <!-- people: 3 rows -->
      ${Array.from({ length: 3 })
        .map((_, row) => {
          const y = 240 + row * 60;
          const count = 10 + row * 2;
          return Array.from({ length: count })
            .map((__, i) => {
              const x = (900 / (count + 1)) * (i + 1) + (row % 2 ? 10 : 0);
              return `
            <g transform="translate(${x} ${y})">
              <path d="M-20 80 Q -20 30 0 22 Q 20 30 20 80 Z" fill="#ede3cb" opacity="0.92"/>
              <circle cx="0" cy="10" r="12" fill="#c69b77"/>
              <path d="M-11 6 Q -8 -6 0 -6 Q 8 -6 11 6 Q 8 2 0 2 Q -8 2 -11 6 Z" fill="#2a1808"/>
            </g>`;
            })
            .join('');
        })
        .join('')}
      <!-- warm glow -->
      <ellipse cx="450" cy="180" rx="360" ry="150" fill="rgba(248,236,209,0.08)"/>
    `;
    frame.appendChild(photo);
    wrap.appendChild(frame);

    const caption = document.createElement('div');
    caption.style.cssText = 'text-align:center;color:var(--ivory-dim);';
    caption.innerHTML = `
      <p class="body-han" style="font-style:italic;">${groupPhoto.subtitle}</p>
      <p class="overline" style="margin-top:0.8em;">${groupPhoto.date}</p>
    `;
    wrap.appendChild(caption);

    node.appendChild(wrap);

    gsap.from(wrap.children, {
      y: 24,
      opacity: 0,
      duration: 1.1,
      stagger: 0.18,
      ease: 'power2.out'
    });

    setHUD('IX · 大合照', '投影片至此　·　按 → 揭曉');
  }
  function unmount() {}
  return { mount, unmount };
}
