import gsap from 'gsap';
import { createBaroqueFrame } from '../components/LaceFrame.js';
import { vicePresidentSpeech } from '../data/ceremony.js';

// 副院長致詞（開場影片）— placeholder，之後可把 <video> 換成真實 MP4。
export function vicePresidentScene() {
  function mount(container, { setHUD }) {
    const mist = document.createElement('div');
    mist.style.cssText = `
      position:absolute;inset:0;pointer-events:none;
      background:
        radial-gradient(ellipse 60% 50% at 50% 40%, rgba(58,107,110,0.16), transparent 70%),
        radial-gradient(ellipse 80% 60% at 50% 100%, rgba(20,30,34,0.4), transparent 60%);
    `;
    container.appendChild(mist);

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      display:flex;flex-direction:column;align-items:center;gap:clamp(24px,3vh,40px);
      width:min(80vw,1040px);text-align:center;
    `;

    const head = document.createElement('div');
    head.innerHTML = `
      <div class="overline">${vicePresidentSpeech.overline}</div>
      <div class="rule"></div>
      <h2 class="title-han" style="margin-bottom:0.4em;">${vicePresidentSpeech.title}</h2>
      <p class="body-italic" style="font-style:italic;">${vicePresidentSpeech.speaker}</p>
    `;
    wrap.appendChild(head);

    const frame = createBaroqueFrame();
    frame.style.cssText = 'width:100%;aspect-ratio:16/9;padding:clamp(20px,2.5vw,40px);';
    // Placeholder "video window" — dark with centered play motif
    const playArea = document.createElement('div');
    playArea.style.cssText = `
      width:100%;height:100%;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:18px;
      background:
        radial-gradient(ellipse at 50% 50%, #1a1008 0%, #000 80%);
      border:1px solid rgba(201,169,110,0.3);
    `;
    playArea.innerHTML = `
      <svg width="clamp(56px,6vw,96px)" height="clamp(56px,6vw,96px)" viewBox="0 0 64 64" style="color:#b76e79;">
        <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="1" fill="none" opacity="0.6"/>
        <polygon points="25,20 25,44 46,32" fill="currentColor" opacity="0.9"/>
      </svg>
      <div class="overline" style="color:#9a8a70;">Vidéo · 影片播放區</div>
      <p class="body-han" style="color:#9a8a70;font-size:clamp(12px,1.1vw,15px);opacity:0.7;max-width:60ch;">
        ${vicePresidentSpeech.caption}
      </p>
    `;
    frame.appendChild(playArea);
    wrap.appendChild(frame);

    container.appendChild(wrap);

    gsap.from([head, frame], {
      y: 24,
      opacity: 0,
      duration: 1.0,
      stagger: 0.22,
      ease: 'power2.out'
    });

    setHUD('III · 副院長致詞', '空白鍵 / → 下一段');
  }
  function unmount() {}
  return { mount, unmount };
}
