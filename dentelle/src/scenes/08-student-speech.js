import gsap from 'gsap';
import { createBaroqueFrame } from '../components/LaceFrame.js';
import { studentSpeech } from '../data/ceremony.js';

// 118 級在校生致辭
export function studentSpeechScene() {
  function mount(container, { setHUD }) {
    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    container.appendChild(mist);

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      display:flex;flex-direction:column;align-items:center;gap:clamp(18px,2.5vh,32px);
      width:min(78vw,1000px);text-align:center;
    `;

    const head = document.createElement('div');
    head.innerHTML = `
      <div class="overline">${studentSpeech.overline}</div>
      <div class="rule"></div>
      <h2 class="title-han" style="margin-bottom:0.4em;">${studentSpeech.title}</h2>
      <p class="body-italic" style="font-style:italic;color:var(--gold);">${studentSpeech.representative.name}</p>
    `;
    wrap.appendChild(head);

    const frame = createBaroqueFrame();
    frame.style.cssText = 'width:100%;';
    frame.innerHTML += `
      ${studentSpeech.excerpts
        .map((e) => `<p class="body-han" style="margin:0.8em 0;">${e}</p>`)
        .join('')}
      <div class="rule" style="margin:1.4em 0;"></div>
      <p class="body-italic" style="text-align:center;color:var(--ivory);">
        ${studentSpeech.closing}
      </p>
    `;
    wrap.appendChild(frame);

    container.appendChild(wrap);

    gsap.from([head, frame], {
      y: 22,
      opacity: 0,
      duration: 1,
      stagger: 0.22,
      ease: 'power2.out'
    });

    setHUD('VII · 在校生致辭', '空白鍵 / → 宣誓');
  }
  function unmount() {}
  return { mount, unmount };
}
