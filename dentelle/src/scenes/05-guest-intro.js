import gsap from 'gsap';
import { createLaceFrame } from '../components/LaceFrame.js';
import { createPortrait } from '../components/PortraitWall.js';
import { guests } from '../data/ceremony.js';

// 與會師長介紹（10 位）— 網格呈現
export function guestIntroScene() {
  function mount(container, { setHUD }) {
    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    container.appendChild(mist);

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      display:flex;flex-direction:column;align-items:center;gap:clamp(20px,3vh,34px);
      width:min(90vw,1280px);
    `;

    const head = document.createElement('div');
    head.style.cssText = 'text-align:center;';
    head.innerHTML = `
      <div class="overline">Invités d'honneur · 與會師長</div>
      <div class="rule"></div>
      <h2 class="title-han" style="margin-bottom:0.3em;">今日蒞臨師長</h2>
      <p class="body-han" style="font-style:italic;opacity:0.75;max-width:56ch;margin:0 auto;">
        在此代表 117 級學長姐，向今日蒞臨的所有師長致上最誠摯的感謝。
      </p>
    `;
    wrap.appendChild(head);

    const grid = createLaceFrame({ sides: false });
    grid.style.cssText = `
      width:100%;padding:clamp(28px,3vw,48px);
      display:grid;
      grid-template-columns:repeat(5, minmax(0,1fr));
      gap:clamp(16px,1.6vw,28px);
      align-items:end;
    `;

    guests.forEach((g) => {
      const cell = document.createElement('div');
      cell.style.cssText =
        'display:flex;flex-direction:column;align-items:center;gap:10px;';
      const p = createPortrait({
        name: g.name,
        role: g.title,
        isTeacher: true
      });
      p.style.width = '100%';
      cell.appendChild(p);

      const caption = document.createElement('div');
      caption.style.cssText = 'text-align:center;margin-top:4px;';
      caption.innerHTML = `
        <div class="overline" style="font-size:clamp(9px,0.85vw,12px);color:var(--gold);letter-spacing:0.3em;">${g.title}</div>
        <div class="body-han" style="font-size:clamp(13px,1.15vw,17px);letter-spacing:0.15em;margin-top:2px;">${g.name}</div>
      `;
      cell.appendChild(caption);
      grid.appendChild(cell);
    });
    wrap.appendChild(grid);

    container.appendChild(wrap);

    gsap.from(head, { y: 20, opacity: 0, duration: 1, ease: 'power2.out' });
    gsap.from(grid, { y: 24, opacity: 0, duration: 1, delay: 0.3, ease: 'power2.out' });
    gsap.from(grid.children, {
      y: 20,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      delay: 0.7,
      ease: 'power2.out'
    });

    setHUD('V · 與會師長', '空白鍵 / → 繼續');
  }
  function unmount() {}
  return { mount, unmount };
}
