import gsap from 'gsap';
import { createBaroqueFrame } from '../components/LaceFrame.js';
import { createPortrait } from '../components/PortraitWall.js';
import { dignitarySpeeches } from '../data/ceremony.js';

// 三位來賓致詞輪播：黃則達 / 陳永崇 / 陳畊仲
export function dignitarySpeechScene() {
  let idx = 0;
  let cards = [];

  function show(i) {
    cards.forEach((c, k) => {
      gsap.to(c, {
        opacity: k === i ? 1 : 0,
        y: k === i ? 0 : 18,
        duration: 0.8,
        ease: 'power2.out',
        pointerEvents: k === i ? 'auto' : 'none'
      });
    });
    const hud = document.getElementById('hud-chapter');
    if (hud) hud.textContent = `IV · 來賓致詞  (${i + 1}/${dignitarySpeeches.length})`;
  }

  function mount(container, { setHUD }) {
    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    container.appendChild(mist);

    const overline = document.createElement('div');
    overline.className = 'overline';
    overline.textContent = 'Allocutions des Invités · 來賓致詞';
    overline.style.cssText =
      'position:absolute;top:7vh;left:0;right:0;text-align:center;';
    container.appendChild(overline);

    const stage = document.createElement('div');
    stage.style.cssText = `
      position:relative;width:100%;height:100%;
      display:flex;align-items:center;justify-content:center;
    `;
    container.appendChild(stage);

    cards = dignitarySpeeches.map((s) => {
      const card = document.createElement('div');
      card.style.cssText = `
        position:absolute;display:grid;
        grid-template-columns:minmax(200px, 25vw) 1fr;
        gap:clamp(28px,4vw,64px);align-items:center;
        width:min(82vw,1060px);opacity:0;
      `;

      const portrait = createPortrait({
        name: s.name,
        role: s.role,
        isTeacher: true
      });
      portrait.style.width = '100%';

      const frame = createBaroqueFrame();
      frame.innerHTML += `
        <div class="overline" style="margin-bottom:0.6em;">${s.role}</div>
        <div class="title-han" style="margin-bottom:0.3em;font-size:clamp(24px,2.8vw,38px);">${s.name}</div>
        <div class="body-italic" style="color:var(--gold);font-size:clamp(13px,1.2vw,18px);margin-bottom:1.2em;font-style:italic;">${s.title}</div>
        <p class="body-han" style="margin:0.6em 0;">${s.intro}</p>
        <div class="rule" style="margin:1.2em 0;"></div>
        <p class="body-han" style="color:var(--ivory);font-style:italic;">${s.blessing}</p>
      `;

      card.appendChild(portrait);
      card.appendChild(frame);
      stage.appendChild(card);
      return card;
    });

    show(0);
    setHUD(`IV · 來賓致詞  (1/${dignitarySpeeches.length})`, '空白鍵 / → 下一位');
  }

  function onAdvance() {
    if (idx < dignitarySpeeches.length - 1) {
      idx++;
      show(idx);
      return true;
    }
    return false;
  }
  function onBack() {
    if (idx > 0) {
      idx--;
      show(idx);
      return true;
    }
    return false;
  }
  function unmount() {
    cards = [];
  }

  return { mount, unmount, onAdvance, onBack };
}
