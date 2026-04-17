import * as THREE from 'three';
import gsap from 'gsap';
import { createToothMesh, createGumBase } from '../components/ToothMesh.js';
import { ceremonyMeta } from '../data/ceremony.js';

// Simplified Elden-Ring style title: just the massive DENTELLE wordmark,
// one class line above, one PRESS ANY BUTTON below. Nothing else.
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
        radial-gradient(ellipse 50% 40% at 50% 60%, rgba(58,107,110,0.20), transparent 65%),
        radial-gradient(ellipse 140% 100% at 50% 50%, #050302 0%, #000 80%);
      pointer-events:none;
    `;
    container.appendChild(bg);

    const teal = document.createElement('div');
    teal.className = 'teal-mist';
    container.appendChild(teal);

    const vignette = document.createElement('div');
    vignette.style.cssText = `
      position:absolute;inset:0;pointer-events:none;
      box-shadow:inset 0 0 240px 60px rgba(0,0,0,0.95),
                 inset 0 0 70px 10px rgba(0,0,0,0.8);
    `;
    container.appendChild(vignette);

    // --- 3D tooth (dim silhouette deep behind) ---
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
    camera = new THREE.PerspectiveCamera(
      28,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.2, 9);
    camera.lookAt(0, -0.6, 0);

    scene.add(new THREE.AmbientLight(0x120b06, 0.4));
    const spot = new THREE.SpotLight(0xb76e79, 3.0, 20, Math.PI / 7, 0.6, 1.3);
    spot.position.set(0, 8, 5);
    spot.target.position.set(0, -0.6, 0);
    scene.add(spot, spot.target);
    const rim = new THREE.DirectionalLight(0x6aa0a8, 0.5);
    rim.position.set(-4, 1, -3);
    scene.add(rim);

    gum = createGumBase({ radius: 1.35 });
    gum.position.y = -2.4;
    scene.add(gum);

    tooth = createToothMesh({ scale: 1.1 });
    tooth.position.y = -0.4;
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

    gsap.to(canvas, { opacity: 0.4, duration: 4.5, delay: 0.8, ease: 'power2.out' });

    // --- ember particle canvas ---
    const embers = document.createElement('canvas');
    embers.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(embers);
    const ectx = embers.getContext('2d');
    const sizeEmbers = () => {
      embers.width = window.innerWidth;
      embers.height = window.innerHeight;
    };
    sizeEmbers();

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.15 + Math.random() * 0.4),
      r: 0.5 + Math.random() * 1.4,
      life: Math.random(),
      lifeSpeed: 0.001 + Math.random() * 0.003,
      hue: 35 + Math.random() * 25
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
        const alpha = Math.sin(p.life * Math.PI) * 0.85;
        const grd = ectx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grd.addColorStop(0, `hsla(${p.hue}, 80%, 72%, ${alpha})`);
        grd.addColorStop(0.4, `hsla(${p.hue}, 80%, 55%, ${alpha * 0.5})`);
        grd.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`);
        ectx.fillStyle = grd;
        ectx.beginPath();
        ectx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ectx.fill();
        ectx.fillStyle = `hsla(${p.hue}, 90%, 88%, ${alpha})`;
        ectx.beginPath();
        ectx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ectx.fill();
      });
    };
    drawEmbers();

    // --- overlay : class line + huge DENTELLE + press any button ---
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:flex-start;pointer-events:none;
      text-align:center;gap:clamp(14px,1.8vh,22px);
      padding:clamp(48px,8vh,110px) 6vw 0;
    `;
    overlay.innerHTML = `
      <div class="er-class">
        <div class="er-inst">國立成功大學　牙醫學系</div>
        <div class="er-class-line">117 級 · 第四屆授袍典禮</div>
      </div>

      <h1 class="er-title foil-title" data-text="DENTELLE">DENTELLE</h1>

      <div class="er-hint">PRESS&nbsp;ANY&nbsp;BUTTON</div>
    `;
    container.appendChild(overlay);

    const style = document.createElement('style');
    style.textContent = `
      .er-class {
        display:flex;flex-direction:column;align-items:center;gap:6px;
      }
      .er-inst {
        font-family: var(--font-han);
        color: #d8b8bc;
        font-weight: 300;
        letter-spacing: 0.5em;
        font-size: clamp(11px, 1.05vw, 15px);
        opacity: 0.85;
      }
      .er-class-line {
        font-family: var(--font-italic);
        font-style: italic;
        color: #b76e79;
        font-size: clamp(12px, 1.15vw, 17px);
        letter-spacing: 0.35em;
        opacity: 0.9;
        text-shadow: 0 0 16px rgba(183,110,121,0.4);
      }
      .er-title {
        font-family: var(--font-decor);
        font-weight: 900;
        font-size: clamp(58px, 11vw, 170px);
        line-height: 1;
        letter-spacing: 0.02em;
        margin: 0;
      }
      .er-hint {
        font-family: var(--font-latin);
        color: #9a8a70;
        letter-spacing: 0.55em;
        font-size: clamp(10px, 1vw, 13px);
        position: absolute;
        bottom: 6vh;left:0;right:0;
        animation: er-pulse 2.6s ease-in-out infinite;
      }
      @keyframes er-pulse {
        0%,100% { opacity: 0.3; }
        50% { opacity: 0.9; }
      }
    `;
    container.appendChild(style);

    // Cinematic fade-in
    gsap.set('.er-class, .er-title, .er-hint', { opacity: 0, y: 18 });
    gsap.to('.er-class', { opacity: 1, y: 0, duration: 2.0, delay: 0.4, ease: 'power2.out' });
    gsap.to('.er-title', { opacity: 1, y: 0, duration: 2.8, delay: 1.0, ease: 'power3.out' });
    gsap.to('.er-hint', { opacity: 1, y: 0, duration: 1.0, delay: 2.8, ease: 'power2.out' });

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
      tooth.position.y = -0.4 + Math.sin(t * 0.7) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    mount._cleanup = () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    setHUD('Prélude', 'PRESS ANY BUTTON');
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

  // suppress used-var warning; intentionally referenced
  void ceremonyMeta;
  return { mount, unmount };
}
