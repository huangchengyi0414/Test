import * as THREE from 'three';
import gsap from 'gsap';
import { createToothMesh, createGumBase } from '../components/ToothMesh.js';
import { ceremonyMeta } from '../data/ceremony.js';

// Elden-Ring style title screen: huge serif wordmark, bronze glow,
// menu options centered below a divider, slow ember particles, and
// a dim 3D tooth far back acting as the Erdtree-esque silhouette.
export function loginScene() {
  let renderer, scene, camera, tooth, gum, rafId, embersRaf;
  let onResize;
  let dragging = false;
  let lastX = 0;
  let targetRotY = 0;
  let currentRotY = 0;

  function mount(container, { advance, setHUD }) {
    // --- layered vignette background ---
    const bg = document.createElement('div');
    bg.style.cssText = `
      position:absolute;inset:0;
      background:
        radial-gradient(ellipse 55% 45% at 50% 58%, rgba(201,169,110,0.10), transparent 70%),
        radial-gradient(ellipse 90% 80% at 50% 120%, rgba(160,110,60,0.08), transparent 60%),
        radial-gradient(ellipse 140% 100% at 50% 50%, #050302 0%, #000 80%);
      pointer-events:none;
    `;
    container.appendChild(bg);

    // inner frame vignette
    const vignette = document.createElement('div');
    vignette.style.cssText = `
      position:absolute;inset:0;pointer-events:none;
      box-shadow:inset 0 0 220px 40px rgba(0,0,0,0.95),
                 inset 0 0 60px 10px rgba(0,0,0,0.8);
    `;
    container.appendChild(vignette);

    // --- 3D tooth (dim, behind everything) ---
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position:absolute;inset:0;width:100%;height:100%;
      opacity:0;pointer-events:auto;
    `;
    canvas.dataset.noAdvance = 'true';
    container.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.4, 9);
    camera.lookAt(0, -0.3, 0);

    scene.add(new THREE.AmbientLight(0x120b06, 0.5));
    const spot = new THREE.SpotLight(0xc9a96e, 3.5, 20, Math.PI / 7, 0.6, 1.3);
    spot.position.set(0, 8, 5);
    spot.target.position.set(0, -0.2, 0);
    scene.add(spot, spot.target);
    const rim = new THREE.DirectionalLight(0xffa855, 0.8);
    rim.position.set(-4, 1, -3);
    scene.add(rim);

    gum = createGumBase({ radius: 1.35 });
    scene.add(gum);

    tooth = createToothMesh({ scale: 1.1 });
    scene.add(tooth);

    // pointer drag to rotate tooth
    const onPointerDown = (e) => {
      dragging = true;
      lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      targetRotY += (x - lastX) * 0.01;
      lastX = x;
    };
    const onPointerUp = () => {
      dragging = false;
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    gsap.to(canvas, { opacity: 0.55, duration: 4.5, delay: 0.8, ease: 'power2.out' });

    // --- ember particle canvas ---
    const embers = document.createElement('canvas');
    embers.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(embers);
    const ectx = embers.getContext('2d');
    const sizeEmbers = () => {
      embers.width = window.innerWidth;
      embers.height = window.innerHeight;
    };
    sizeEmbers();

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(0.2 + Math.random() * 0.5),
      r: 0.6 + Math.random() * 1.6,
      life: Math.random(),
      lifeSpeed: 0.001 + Math.random() * 0.004,
      hue: 35 + Math.random() * 20
    }));

    const drawEmbers = () => {
      embersRaf = requestAnimationFrame(drawEmbers);
      ectx.clearRect(0, 0, embers.width, embers.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += p.lifeSpeed;
        if (p.life > 1 || p.y < -20) {
          p.x = Math.random() * embers.width;
          p.y = embers.height + 20;
          p.life = 0;
        }
        const alpha = Math.sin(p.life * Math.PI) * 0.9;
        const grd = ectx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grd.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${alpha})`);
        grd.addColorStop(0.4, `hsla(${p.hue}, 80%, 55%, ${alpha * 0.5})`);
        grd.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`);
        ectx.fillStyle = grd;
        ectx.beginPath();
        ectx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ectx.fill();
        ectx.fillStyle = `hsla(${p.hue}, 90%, 85%, ${alpha})`;
        ectx.beginPath();
        ectx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ectx.fill();
      });
    };
    drawEmbers();

    // --- title + menu overlay ---
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;pointer-events:none;
      text-align:center;gap:clamp(28px,3.5vh,48px);padding:0 6vw;
    `;
    overlay.innerHTML = `
      <div class="er-top" style="display:flex;flex-direction:column;align-items:center;gap:12px;">
        <div class="er-overline">${ceremonyMeta.subtitle}</div>
      </div>

      <h1 class="er-title">DENTELLE</h1>

      <div class="er-sub" style="display:flex;align-items:center;gap:clamp(16px,2vw,28px);">
        <span class="er-line"></span>
        <span class="er-sub-text">${ceremonyMeta.titleHan}</span>
        <span class="er-line"></span>
      </div>

      <div class="er-menu">
        <button class="er-item" data-no-advance="true" data-action="start">
          <span class="er-marker">◆</span><span>Commencer la cérémonie</span><span class="er-cn">　開始典禮</span>
        </button>
        <button class="er-item" data-no-advance="true" data-action="continue">
          <span class="er-marker">◇</span><span>Continuer</span><span class="er-cn">　繼續</span>
        </button>
        <button class="er-item er-item--sub" data-no-advance="true" data-action="about">
          <span class="er-marker">·</span><span>À propos</span><span class="er-cn">　關於</span>
        </button>
      </div>

      <div class="er-hint">PRESS SPACE · 按空白鍵進入</div>
    `;
    container.appendChild(overlay);

    // Elden-Ring style CSS (scoped to this scene)
    const style = document.createElement('style');
    style.textContent = `
      .er-overline {
        font-family: var(--font-latin);
        font-style: italic;
        color: #c9a96e;
        letter-spacing: 0.55em;
        text-transform: uppercase;
        font-size: clamp(12px, 1.15vw, 16px);
        opacity: 0.85;
        text-shadow: 0 0 18px rgba(201,169,110,0.4);
      }
      .er-title {
        font-family: var(--font-latin);
        font-weight: 500;
        font-size: clamp(80px, 16vw, 260px);
        line-height: 0.9;
        letter-spacing: 0.14em;
        color: #e8c889;
        background: linear-gradient(180deg, #f8e6b6 0%, #c9a96e 45%, #7a5a2e 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 80px rgba(201,169,110,0.35);
        filter: drop-shadow(0 4px 30px rgba(201,169,110,0.3));
        margin: 0;
      }
      .er-sub-text {
        font-family: var(--font-han);
        color: #d8c9a8;
        letter-spacing: 0.5em;
        font-size: clamp(14px, 1.6vw, 22px);
        text-shadow: 0 0 20px rgba(201,169,110,0.3);
      }
      .er-line {
        width: clamp(60px, 10vw, 160px);
        height: 1px;
        background: linear-gradient(90deg, transparent, #c9a96e 50%, transparent);
        opacity: 0.7;
      }
      .er-menu {
        display:flex;flex-direction:column;align-items:center;
        gap: clamp(6px, 0.9vh, 14px);
        margin-top: clamp(10px, 2vh, 24px);
        pointer-events:auto;
      }
      .er-item {
        background: transparent;border:none;cursor:pointer;
        font-family: var(--font-latin);
        font-size: clamp(15px, 1.3vw, 20px);
        letter-spacing: 0.3em;
        color: #d8c9a8;
        padding: 8px 32px;
        display:inline-flex;align-items:baseline;gap:14px;
        transition: color 0.35s, text-shadow 0.35s, transform 0.35s;
      }
      .er-item .er-cn {
        font-family: var(--font-han);
        color: #9a8a70;
        font-size: 0.85em;
        letter-spacing: 0.2em;
      }
      .er-item .er-marker {
        color: #c9a96e;opacity:0.5;transition:opacity 0.35s, transform 0.35s;
        font-size: 0.8em;
      }
      .er-item:hover, .er-item:focus-visible {
        color: #f8e6b6;
        text-shadow: 0 0 18px rgba(232,200,137,0.7);
        outline:none;
        transform: translateY(-1px);
      }
      .er-item:hover .er-marker {
        opacity: 1; transform: translateX(-4px);
      }
      .er-item:hover .er-cn { color: #d8c9a8; }
      .er-item--sub { opacity: 0.65; }
      .er-hint {
        font-family: var(--font-latin);
        color: #9a8a70;
        letter-spacing: 0.5em;
        font-size: clamp(10px, 1vw, 13px);
        margin-top: auto;
        position: absolute;
        bottom: 5vh;left:0;right:0;
        animation: er-pulse 2.6s ease-in-out infinite;
      }
      @keyframes er-pulse {
        0%,100% { opacity: 0.3; }
        50% { opacity: 0.9; }
      }
    `;
    container.appendChild(style);

    // Wire menu
    overlay.querySelectorAll('.er-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.action;
        if (act === 'start' || act === 'continue') advance();
        else if (act === 'about') {
          const modal = document.createElement('div');
          modal.dataset.noAdvance = 'true';
          modal.style.cssText = `
            position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.85);z-index:20;cursor:pointer;
          `;
          modal.innerHTML = `
            <div style="max-width:520px;text-align:center;padding:40px;border:1px solid rgba(201,169,110,0.4);">
              <div class="er-overline" style="margin-bottom:14px;">À propos</div>
              <p class="body-han">一場以「蕾絲 Dentelle」為主題的白袍典禮旅程。<br/>每一針、每一線，都是醫者的修行。</p>
              <p style="margin-top:18px;font-family:var(--font-latin);font-style:italic;color:#c9a96e;letter-spacing:0.2em;">— cliquez pour fermer —</p>
            </div>
          `;
          modal.addEventListener('click', () => modal.remove());
          container.appendChild(modal);
        }
      });
    });

    // Cinematic fade-in sequence
    gsap.set('.er-overline, .er-title, .er-sub, .er-menu, .er-hint', { opacity: 0, y: 20 });
    gsap.to('.er-overline', { opacity: 1, y: 0, duration: 2.0, delay: 0.3, ease: 'power2.out' });
    gsap.to('.er-title', { opacity: 1, y: 0, duration: 2.8, delay: 0.9, ease: 'power3.out' });
    gsap.to('.er-sub', { opacity: 1, y: 0, duration: 1.6, delay: 2.3, ease: 'power2.out' });
    gsap.to('.er-menu', { opacity: 1, y: 0, duration: 1.8, delay: 3.0, ease: 'power2.out' });
    gsap.to('.er-hint', { opacity: 1, y: 0, duration: 1.2, delay: 3.8, ease: 'power2.out' });

    onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      sizeEmbers();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      currentRotY += (targetRotY - currentRotY) * 0.08;
      tooth.rotation.y = currentRotY + t * 0.08;
      tooth.position.y = -0.3 + Math.sin(t * 0.7) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    // clean up helpers
    mount._cleanup = () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    setHUD('Prélude · 登入', '空白鍵 / 點選選單　·　拖曳牙齒');
  }

  function unmount() {
    cancelAnimationFrame(rafId);
    cancelAnimationFrame(embersRaf);
    window.removeEventListener('resize', onResize);
    mount._cleanup?.();
    renderer?.dispose();
    scene?.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m.dispose());
      }
    });
  }

  return { mount, unmount };
}
