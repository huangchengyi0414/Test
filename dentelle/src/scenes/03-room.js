import gsap from 'gsap';
import { createSpotlight } from '../components/SpotlightStage.js';
import { createPortraitWall } from '../components/PortraitWall.js';
import { createScallopRibbon } from '../components/LaceFrame.js';

// roomData = { index, name, han, teacher:{name,role}, students:[{name,latin}] }
export function roomScene(roomData) {
  let highlightIdx = -1; // -1 = show teacher highlighted
  let studentEls = [];
  let teacherEl = null;
  let hudHint;

  function highlight(i) {
    // Dim all, raise one
    [teacherEl, ...studentEls].forEach((el) => el?.classList.remove('active'));
    if (i === -1) teacherEl?.classList.add('active');
    else studentEls[i]?.classList.add('active');
  }

  function updateHud() {
    const hud = document.getElementById('hud-chapter');
    const total = studentEls.length;
    if (!hud) return;
    if (highlightIdx === -1) {
      hud.textContent = `${roomData.name} · ${roomData.han}  · 授袍者就位`;
    } else {
      hud.textContent = `${roomData.name} · ${roomData.han}  · 受袍 ${highlightIdx + 1}/${total}`;
    }
  }

  function mount(node, { setHUD }) {
    node.appendChild(createSpotlight());

    // Tapestry / wall backdrop with vertical lace sides
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position:absolute;inset:8vh 8vw;
      border:1px solid rgba(201,169,110,0.18);
      background:
        linear-gradient(180deg, rgba(26,19,10,0.7), rgba(10,6,4,0.9)),
        repeating-linear-gradient(0deg, rgba(201,169,110,0.04) 0 2px, transparent 2px 6px);
      pointer-events:none;
    `;
    node.appendChild(backdrop);

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      position:absolute;top:10vh;left:0;right:0;text-align:center;
      display:flex;flex-direction:column;align-items:center;gap:10px;
    `;
    header.innerHTML = `
      <div class="overline">${roomData.name}</div>
      <h2 class="title-han" style="font-size:clamp(26px,3.2vw,44px);">${roomData.han}</h2>
    `;
    const ribbon = createScallopRibbon(280);
    ribbon.style.marginTop = '6px';
    header.appendChild(ribbon);
    node.appendChild(header);

    // Portrait wall
    const { wall, teacherEl: t, studentEls: s } = createPortraitWall({
      teacher: roomData.teacher,
      students: roomData.students
    });
    teacherEl = t;
    studentEls = s;

    wall.style.position = 'absolute';
    wall.style.top = '30vh';
    wall.style.left = '10vw';
    wall.style.right = '10vw';
    wall.style.width = 'auto';
    wall.style.height = 'auto';
    node.appendChild(wall);

    gsap.from(wall.children, {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 1.0,
      ease: 'power2.out'
    });

    // Start with teacher highlighted
    highlightIdx = -1;
    highlight(-1);
    updateHud();

    hudHint = '空白鍵 / → 下一位受袍者';
    setHUD(undefined, hudHint);
  }

  function onAdvance() {
    const total = studentEls.length;
    if (highlightIdx < total - 1) {
      highlightIdx++;
      highlight(highlightIdx);
      updateHud();
      return true;
    }
    return false;
  }

  function onBack() {
    if (highlightIdx > -1) {
      highlightIdx--;
      highlight(highlightIdx);
      updateHud();
      return true;
    }
    return false;
  }

  function unmount() {
    studentEls = [];
    teacherEl = null;
  }

  return { mount, unmount, onAdvance, onBack };
}
