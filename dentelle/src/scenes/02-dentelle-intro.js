import gsap from 'gsap';
import { createBaroqueFrame } from '../components/LaceFrame.js';
import { dentelleIntro } from '../data/ceremony.js';

// Dentelle 詞義場景 — 司儀開場第二段。巨大 Dentelle 浮字 + 段落 + 結尾祝福。
export function dentelleIntroScene() {
  function mount(container, { setHUD }) {
    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    container.appendChild(mist);

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:relative;width:min(78vw,1100px);
      display:flex;flex-direction:column;align-items:center;gap:clamp(20px,3vh,40px);
    `;

    const headline = document.createElement('div');
    headline.style.cssText = 'text-align:center;';
    headline.innerHTML = `
      <div class="overline">${dentelleIntro.overline}</div>
      <h2 class="foil-title" data-text="Dentelle"
          style="font-family:var(--font-decor);font-weight:700;
                 font-size:clamp(58px,10vw,150px);line-height:1;margin:0.3em 0 0.1em;">
        Dentelle
      </h2>
    `;
    wrap.appendChild(headline);

    const frame = createBaroqueFrame();
    frame.style.cssText =
      'width:100%;max-width:900px;padding:clamp(36px,4vw,64px) clamp(44px,5vw,84px);';
    frame.innerHTML += `
      ${dentelleIntro.paragraphs
        .map((p) => `<p class="body-han" style="margin:0.75em 0;">${p}</p>`)
        .join('')}
      <div class="rule" style="margin:1.6em auto;"></div>
      <p class="body-italic" style="text-align:center;">
        ${dentelleIntro.closing}
      </p>
    `;
    wrap.appendChild(frame);

    container.appendChild(wrap);

    gsap.from([headline, frame], {
      y: 28,
      opacity: 0,
      duration: 1.2,
      stagger: 0.25,
      ease: 'power2.out'
    });
    gsap.from(frame.querySelectorAll('p'), {
      y: 12,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      delay: 0.9,
      ease: 'power2.out'
    });

    setHUD('II · Dentelle 之意', '空白鍵 / → 繼續');
  }
  function unmount() {}
  return { mount, unmount };
}
