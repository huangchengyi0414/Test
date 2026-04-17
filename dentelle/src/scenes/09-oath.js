import gsap from 'gsap';
import { createBaroqueFrame } from '../components/LaceFrame.js';
import { oath } from '../data/ceremony.js';

// 日內瓦宣言（中文）— 領誓：鍾英弘
export function oathScene() {
  function mount(container, { setHUD }) {
    const candles = document.createElement('div');
    candles.style.cssText = `
      position:absolute;inset:0;pointer-events:none;
      background:
        radial-gradient(circle at 12% 82%, rgba(232,200,137,0.2), transparent 22%),
        radial-gradient(circle at 88% 82%, rgba(232,200,137,0.2), transparent 22%),
        radial-gradient(circle at 50% 8%, rgba(248,236,209,0.14), transparent 40%);
    `;
    container.appendChild(candles);
    gsap.to(candles, {
      opacity: 0.6,
      duration: 2.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      display:flex;flex-direction:column;align-items:center;gap:clamp(18px,2.5vh,32px);
      width:min(72vw,950px);
    `;

    const head = document.createElement('div');
    head.style.cssText = 'text-align:center;';
    head.innerHTML = `
      <div class="overline">${oath.overline}</div>
      <div class="rule"></div>
      <h2 class="title-han" style="margin-bottom:0.3em;">${oath.title}</h2>
      <p class="body-italic" style="font-style:italic;color:var(--gold-bright);">${oath.subtitle}</p>
      <p class="body-han" style="margin-top:0.8em;opacity:0.7;font-size:clamp(12px,1.05vw,15px);">
        領誓　<span style="color:var(--ivory);">${oath.leader.name}</span>　${oath.leader.role}
      </p>
    `;
    wrap.appendChild(head);

    const frame = createBaroqueFrame();
    frame.style.cssText = 'width:100%;padding:clamp(36px,4.5vw,72px);';
    frame.innerHTML += `
      <p class="body-han" style="text-align:center;font-style:italic;margin-bottom:1.5em;opacity:0.85;">${oath.preface}</p>
      <div class="rule" style="margin:1em auto 1.5em;"></div>
      ${oath.paragraphs
        .map(
          (p) =>
            `<p class="body-han" style="margin:0.6em 0;text-align:center;">${p}</p>`
        )
        .join('')}
      <div class="rule" style="margin-top:1.8em;"></div>
      <p class="body-italic" style="text-align:center;color:var(--gold);font-style:italic;letter-spacing:0.2em;">
        ${oath.closing}
      </p>
    `;
    wrap.appendChild(frame);
    container.appendChild(wrap);

    gsap.from([head, frame], {
      y: 24,
      opacity: 0,
      duration: 1.1,
      stagger: 0.25,
      ease: 'power2.out'
    });
    gsap.from(frame.querySelectorAll('p'), {
      y: 10,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      delay: 1.0,
      ease: 'power2.out'
    });

    setHUD('VIII · 醫師宣誓', '空白鍵 / → 大合照');
  }
  function unmount() {}
  return { mount, unmount };
}
