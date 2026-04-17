import gsap from 'gsap';
import { createSpotlight } from '../components/SpotlightStage.js';
import { createLaceFrame } from '../components/LaceFrame.js';
import { createPortrait } from '../components/PortraitWall.js';
import { blessings } from '../data/ceremony.js';

export function blessingsScene() {
  let idx = 0;
  let cards = [];
  let container;

  function show(i) {
    cards.forEach((c, k) => {
      const isActive = k === i;
      gsap.to(c, {
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 16,
        duration: 0.8,
        ease: 'power2.out',
        pointerEvents: isActive ? 'auto' : 'none'
      });
    });
  }

  function mount(node, { setHUD }) {
    container = node;
    node.appendChild(createSpotlight());

    const overline = document.createElement('div');
    overline.className = 'overline';
    overline.textContent = 'Bénédictions des Maîtres · 老師祝福';
    overline.style.cssText =
      'position:absolute;top:8vh;left:0;right:0;text-align:center;';
    node.appendChild(overline);

    const stage = document.createElement('div');
    stage.style.cssText = `
      position:relative;width:100%;height:100%;
      display:flex;align-items:center;justify-content:center;
    `;
    node.appendChild(stage);

    cards = blessings.map((b, i) => {
      const card = document.createElement('div');
      card.style.cssText = `
        position:absolute;display:grid;grid-template-columns:auto 1fr;
        gap:clamp(28px,4vw,64px);align-items:center;
        width:min(78vw,980px);opacity:0;
      `;

      const portrait = createPortrait({
        name: b.teacher,
        role: b.role,
        isTeacher: true
      });
      portrait.style.width = 'clamp(180px, 22vw, 280px)';

      const textFrame = createLaceFrame({ sides: false });
      textFrame.innerHTML = `
        <div class="overline" style="margin-bottom:0.8em;">${b.role}</div>
        <div class="title-han" style="margin-bottom:0.4em;font-size:clamp(22px,2.6vw,36px);">${b.teacher}</div>
        <p class="body-han" style="font-style:italic;color:var(--gold-bright);font-family:var(--font-latin);font-size:clamp(18px,2vw,28px);margin:1em 0;">
          « ${b.fr} »
        </p>
        <div class="rule" style="margin:1em 0;"></div>
        <p class="body-han">${b.han}</p>
      `;

      card.appendChild(portrait);
      card.appendChild(textFrame);
      stage.appendChild(card);
      return card;
    });

    show(0);
    setHUD(
      `II · 老師祝福  (${idx + 1}/${blessings.length})`,
      '空白鍵 / → 下一位'
    );
  }

  function onAdvance() {
    if (idx < blessings.length - 1) {
      idx++;
      show(idx);
      // Update HUD hint count
      const hud = document.getElementById('hud-chapter');
      if (hud) hud.textContent = `II · 老師祝福  (${idx + 1}/${blessings.length})`;
      return true;
    }
    return false; // let main advance to next scene
  }

  function onBack() {
    if (idx > 0) {
      idx--;
      show(idx);
      const hud = document.getElementById('hud-chapter');
      if (hud) hud.textContent = `II · 老師祝福  (${idx + 1}/${blessings.length})`;
      return true;
    }
    return false;
  }

  function unmount() {
    cards = [];
  }

  return { mount, unmount, onAdvance, onBack };
}
