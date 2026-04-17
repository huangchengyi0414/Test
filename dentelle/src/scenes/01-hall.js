import gsap from 'gsap';
import { createLaceFrame } from '../components/LaceFrame.js';
import { hallNotes } from '../data/ceremony.js';

export function hallScene() {
  function mount(container, { setHUD }) {
    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    container.appendChild(mist);

    const arch = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arch.setAttribute('viewBox', '0 0 1000 600');
    arch.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    arch.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;opacity:0.32;pointer-events:none;';
    arch.innerHTML = `
      <defs>
        <linearGradient id="arch-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c9a96e" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#c9a96e" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M200 600 L200 250 Q 200 80 500 80 Q 800 80 800 250 L800 600 Z"
            fill="none" stroke="url(#arch-g)" stroke-width="1.5"/>
      <path d="M260 600 L260 260 Q 260 130 500 130 Q 740 130 740 260 L740 600 Z"
            fill="none" stroke="url(#arch-g)" stroke-width="1"/>
    `;
    container.appendChild(arch);

    const frame = createLaceFrame();
    frame.style.cssText = `
      width:min(62vw, 820px);
      min-height:54vh;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      text-align:center;position:relative;z-index:2;
    `;

    frame.innerHTML += `
      <div class="overline">${hallNotes.overline}</div>
      <div class="rule"></div>
      <h2 class="title-han" style="margin-bottom:0.5em;text-align:center;">${hallNotes.title}</h2>
      <p class="body-han" style="opacity:0.8;margin-bottom:2em;text-align:center;">${hallNotes.intro}</p>
      <ol style="list-style:none;counter-reset:notes;margin:0 auto;display:grid;gap:1.4em;max-width:54ch;">
        ${hallNotes.notes
          .map(
            (n) => `
          <li style="display:grid;grid-template-columns:2.4em 1fr;align-items:baseline;counter-increment:notes;">
            <span style="font-family:var(--font-italic);font-style:italic;color:var(--gold);font-size:clamp(14px,1.4vw,20px);letter-spacing:0.1em;">
              <span style="color:var(--gold-bright);">·</span>
            </span>
            <span class="body-han" style="line-height:1.9;">${n.han}</span>
          </li>`
          )
          .join('')}
      </ol>
    `;

    container.appendChild(frame);

    gsap.from(frame, {
      y: 28,
      opacity: 0,
      duration: 1.1,
      ease: 'power2.out'
    });
    gsap.from(frame.querySelectorAll('li'), {
      x: -20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      delay: 0.5,
      ease: 'power2.out'
    });

    setHUD('I · 典禮開始前', '空白鍵 / → 繼續');
  }
  function unmount() {}
  return { mount, unmount };
}
