import gsap from 'gsap';
import { createPortraitWall } from '../components/PortraitWall.js';
import { createScallopRibbon } from '../components/LaceFrame.js';

// 受袍廳場景（可參數化 6 次）
// 流程：
//   1. 黑幕 + 教授說明「請隨我進入第 N 廳」
//   2. 鏡頭穿過拱門（SVG 放大模糊）
//   3. 暗房：只看到 4-5 幅畫的金色輪廓
//   4. 每點擊一下，打燈 + 鏡頭聚焦到下一幅畫，揭示學生姓名
//   5. 全部揭示完→點擊→進下一場景
export function roomScene(roomData) {
  let stage = 'intro'; // intro | entering | revealing | done
  let highlightIdx = -1;
  let studentEls = [];
  let teacherEl = null;
  let introEl = null;
  let arch = null;
  let wall = null;

  function highlight(i) {
    [teacherEl, ...studentEls].forEach((el) => {
      if (!el) return;
      el.classList.remove('active');
      el.classList.add('dimmed');
    });
    if (i === -1) {
      teacherEl?.classList.remove('dimmed');
      teacherEl?.classList.add('active');
    } else if (studentEls[i]) {
      studentEls[i].classList.remove('dimmed');
      studentEls[i].classList.add('active');
    }
  }

  function updateHud() {
    const hud = document.getElementById('hud-chapter');
    if (!hud) return;
    const total = studentEls.length;
    if (stage === 'intro') {
      hud.textContent = `${roomData.roman} · ${roomData.han} · 引導`;
    } else if (stage === 'entering') {
      hud.textContent = `${roomData.roman} · ${roomData.han} · 進入房間`;
    } else if (highlightIdx === -1) {
      hud.textContent = `${roomData.roman} · ${roomData.han} · 授袍者就位`;
    } else {
      hud.textContent = `${roomData.roman} · ${roomData.han} · 受袍 ${highlightIdx + 1}/${total}`;
    }
  }

  function buildArch() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 600 500');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.cssText = `
      position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
      width:60vmin;height:60vmin;color:#c9a96e;pointer-events:none;opacity:0;
    `;
    svg.innerHTML = `
      <defs>
        <linearGradient id="archG-${roomData.index}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c9a96e" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#8b6833" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <path d="M100 500 L100 250 Q 100 80 300 80 Q 500 80 500 250 L500 500 Z"
            fill="none" stroke="url(#archG-${roomData.index})" stroke-width="2.5"/>
      <path d="M140 500 L140 260 Q 140 120 300 120 Q 460 120 460 260 L460 500 Z"
            fill="none" stroke="url(#archG-${roomData.index})" stroke-width="1.5" opacity="0.7"/>
      <path d="M180 500 L180 270 Q 180 160 300 160 Q 420 160 420 270 L420 500 Z"
            fill="none" stroke="url(#archG-${roomData.index})" stroke-width="1" opacity="0.4"/>
    `;
    return svg;
  }

  function buildIntro() {
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:clamp(20px,3vh,36px);
      text-align:center;padding:0 6vw;
    `;
    wrap.innerHTML = `
      <div class="overline">Chambre ${roomData.roman}</div>
      <h1 class="foil-title" data-text="${roomData.roman}"
          style="font-family:var(--font-decor);font-weight:900;
                 font-size:clamp(90px,16vw,220px);line-height:1;margin:0;letter-spacing:0.15em;">
        ${roomData.roman}
      </h1>
      <div class="title-han" style="font-size:clamp(24px,3vw,40px);">${roomData.han}</div>
      <div class="rule-ornate" style="margin-top:18px;">${roomData.timeWindow}</div>
      <div class="body-italic" style="margin-top:12px;font-style:italic;color:var(--gold-bright);max-width:42ch;">
        「授袍人　${roomData.teacher.name}　${roomData.teacher.title}」
      </div>
      <div class="body-han" style="margin-top:8px;opacity:0.75;font-style:italic;">請隨我進入 ${roomData.han}</div>
    `;
    return wrap;
  }

  function buildWall(container) {
    const header = document.createElement('div');
    header.style.cssText = `
      position:absolute;top:8vh;left:0;right:0;text-align:center;
      display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;
    `;
    header.innerHTML = `
      <div class="overline">Chambre ${roomData.roman}  ·  ${roomData.timeWindow}</div>
      <h2 class="title-han" style="font-size:clamp(24px,3vw,40px);">${roomData.han}</h2>
    `;
    const ribbon = createScallopRibbon(300);
    ribbon.style.marginTop = '4px';
    header.appendChild(ribbon);
    container.appendChild(header);

    const { wall: w, teacherEl: t, studentEls: s } = createPortraitWall({
      teacher: {
        name: roomData.teacher.name,
        role: roomData.teacher.latin
      },
      students: roomData.students.map((st) => ({
        name: st.name,
        latin: st.honorific
      }))
    });
    teacherEl = t;
    studentEls = s;

    w.style.position = 'absolute';
    w.style.top = '30vh';
    w.style.left = '8vw';
    w.style.right = '8vw';
    w.style.width = 'auto';
    w.style.opacity = '0';
    container.appendChild(w);
    wall = w;

    // start all dimmed
    [teacherEl, ...studentEls].forEach((el) => el?.classList.add('dimmed'));
  }

  function mount(node, { setHUD }) {
    // dark overlay
    const dim = document.createElement('div');
    dim.style.cssText =
      'position:absolute;inset:0;background:#000;pointer-events:none;';
    node.appendChild(dim);

    const mist = document.createElement('div');
    mist.className = 'teal-mist';
    mist.style.opacity = '0.5';
    node.appendChild(mist);

    arch = buildArch();
    node.appendChild(arch);
    introEl = buildIntro();
    node.appendChild(introEl);

    buildWall(node);

    // intro → reveal animation timeline
    gsap.set(introEl, { opacity: 0, y: 20 });
    gsap.to(introEl, { opacity: 1, y: 0, duration: 1.2, delay: 0.1, ease: 'power2.out' });
    gsap.to(arch, { opacity: 0.55, duration: 2.2, delay: 0.4, ease: 'power2.out' });

    stage = 'intro';
    updateHud();
    setHUD(undefined, '空白鍵 / → 進入');
  }

  function transitionIntoRoom() {
    stage = 'entering';
    updateHud();
    const tl = gsap.timeline();
    tl.to(introEl, { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' });
    tl.to(
      arch,
      {
        scale: 8,
        opacity: 0,
        duration: 1.6,
        ease: 'power3.inOut',
        transformOrigin: '50% 50%'
      },
      0.2
    );
    tl.to(wall, { opacity: 1, duration: 1.0, ease: 'power2.out' }, 1.2);
    const header = wall?.previousElementSibling;
    if (header)
      tl.to(header, { opacity: 1, duration: 1.0, ease: 'power2.out' }, 1.0);
    tl.add(() => {
      stage = 'revealing';
      highlightIdx = -1;
      highlight(-1);
      updateHud();
    });
  }

  function onAdvance() {
    if (stage === 'intro') {
      transitionIntoRoom();
      return true;
    }
    if (stage === 'revealing') {
      if (highlightIdx < studentEls.length - 1) {
        highlightIdx++;
        highlight(highlightIdx);
        updateHud();
        return true;
      }
      stage = 'done';
      return false; // let main.js advance to next scene
    }
    return false;
  }
  function onBack() {
    if (stage === 'revealing' && highlightIdx > -1) {
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
    arch = null;
    wall = null;
    introEl = null;
  }
  return { mount, unmount, onAdvance, onBack };
}
