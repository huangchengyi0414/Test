import gsap from 'gsap';
import { createBaroqueFrame } from '../components/LaceFrame.js';
import { blessingVideos } from '../data/ceremony.js';

// 師長祝福影片場景（多段 ready，目前 placeholder）
export function blessingVideoScene() {
  function mount(container, { setHUD }) {
    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    container.appendChild(mist);

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      display:flex;flex-direction:column;align-items:center;gap:clamp(22px,3vh,38px);
      width:min(82vw,1100px);text-align:center;
    `;

    const head = document.createElement('div');
    head.innerHTML = `
      <div class="overline">${blessingVideos.overline}</div>
      <div class="rule"></div>
      <h2 class="title-han" style="margin-bottom:0.5em;">${blessingVideos.title}</h2>
      <p class="body-han" style="max-width:60ch;margin:0 auto;opacity:0.85;">${blessingVideos.caption}</p>
    `;
    wrap.appendChild(head);

    const frame = createBaroqueFrame();
    frame.style.cssText = 'width:100%;aspect-ratio:16/9;padding:clamp(20px,2.5vw,40px);';
    const inner = document.createElement('div');
    inner.style.cssText = `
      width:100%;height:100%;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:20px;
      background: radial-gradient(ellipse at 50% 50%, #0c1418 0%, #000 85%);
      border:1px solid rgba(201,169,110,0.3);
    `;
    inner.innerHTML = `
      <svg width="clamp(72px,7vw,110px)" height="clamp(72px,7vw,110px)" viewBox="0 0 64 64" style="color:#c9a96e;">
        <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="1" fill="none" opacity="0.55"/>
        <polygon points="25,20 25,44 46,32" fill="currentColor" opacity="0.9"/>
      </svg>
      <div class="overline" style="color:#c9a96e;">Vidéo · 祝福影片</div>
      <p class="body-han" style="color:#9a8a70;opacity:0.7;">（多段影片將於典禮當天插入）</p>
    `;
    frame.appendChild(inner);
    wrap.appendChild(frame);

    const closing = document.createElement('p');
    closing.className = 'body-italic';
    closing.style.cssText =
      'text-align:center;margin-top:1em;color:var(--ivory-dim);font-style:italic;max-width:60ch;';
    closing.textContent =
      '聽完了師長的祝福，相信學長姐心裡明白——在未來遇到任何問題時，這些師長都是大家最堅強的後盾。';
    wrap.appendChild(closing);

    container.appendChild(wrap);
    gsap.from([head, frame, closing], {
      y: 22,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power2.out'
    });

    setHUD('VI · 師長祝福', '空白鍵 / → 進入授袍');
  }
  function unmount() {}
  return { mount, unmount };
}
