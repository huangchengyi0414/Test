import gsap from 'gsap';
import { createLaceFrame } from '../components/LaceFrame.js';
import { createSpotlight } from '../components/SpotlightStage.js';
import { oath } from '../data/ceremony.js';

export function oathScene() {
  function mount(node, { setHUD }) {
    node.appendChild(createSpotlight());

    // Candlelight flicker background
    const candles = document.createElement('div');
    candles.style.cssText = `
      position:absolute;inset:0;pointer-events:none;
      background:
        radial-gradient(circle at 18% 80%, rgba(232,200,137,0.18), transparent 24%),
        radial-gradient(circle at 82% 82%, rgba(232,200,137,0.18), transparent 24%),
        radial-gradient(circle at 50% 10%, rgba(248,236,209,0.12), transparent 38%);
    `;
    node.appendChild(candles);
    gsap.to(candles, {
      opacity: 0.7,
      duration: 2.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    const frame = createLaceFrame();
    frame.style.cssText = `
      width:min(70vw,880px);
      padding:clamp(40px,5vw,80px);
      text-align:center;
    `;
    frame.innerHTML += `
      <div class="overline">${oath.overline}</div>
      <div class="rule"></div>
      <h2 class="title-han" style="margin-bottom:1.2em;">${oath.title}</h2>
      ${oath.paragraphs
        .map(
          (p) =>
            `<p class="body-han" style="margin:0.8em 0;">${p}</p>`
        )
        .join('')}
      <div class="rule" style="margin-top:2em;"></div>
      <p class="body-han" style="font-family:var(--font-latin);font-style:italic;color:var(--gold);letter-spacing:0.2em;">
        Je le jure.
      </p>
    `;

    node.appendChild(frame);

    gsap.from(frame.children, {
      y: 20,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power2.out'
    });

    setHUD('IV · Le Serment  牙醫師誓詞', '空白鍵 / → 大合照');
  }
  function unmount() {}
  return { mount, unmount };
}
