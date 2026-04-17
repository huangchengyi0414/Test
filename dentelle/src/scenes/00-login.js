import * as THREE from 'three';
import gsap from 'gsap';
import { createToothMesh, createGumBase } from '../components/ToothMesh.js';
import { createSpotlight } from '../components/SpotlightStage.js';
import { ceremonyMeta } from '../data/ceremony.js';

export function loginScene() {
  let renderer, scene, camera, tooth, gum, rafId;
  let dragging = false;
  let lastX = 0;
  let targetRotY = 0;
  let currentRotY = 0;
  let onResize;

  function mount(container, { advance, setHUD }) {
    container.appendChild(createSpotlight());

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.dataset.noAdvance = 'true';
    container.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      32,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.3, 6.4);
    camera.lookAt(0, -0.2, 0);

    // Lights — spotlight from above, warm key, cool rim
    const ambient = new THREE.AmbientLight(0x1a110a, 0.4);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xf8ecd1, 3.2, 14, Math.PI / 6, 0.5, 1.2);
    spot.position.set(0, 5, 3);
    spot.target.position.set(0, -0.2, 0);
    scene.add(spot);
    scene.add(spot.target);

    const rim = new THREE.DirectionalLight(0xc9a96e, 0.6);
    rim.position.set(-3, 2, -2);
    scene.add(rim);

    const fill = new THREE.PointLight(0xffb07a, 0.6, 10);
    fill.position.set(2, -1, 2);
    scene.add(fill);

    gum = createGumBase({ radius: 1.4 });
    scene.add(gum);

    tooth = createToothMesh({ scale: 1.0 });
    scene.add(tooth);

    // Floating intro animation
    gsap.from(tooth.position, {
      y: -3.5,
      duration: 2.0,
      ease: 'power2.out'
    });
    gsap.from(tooth.rotation, {
      y: -Math.PI,
      duration: 2.4,
      ease: 'power2.out'
    });

    // Pointer interaction
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

    canvas.addEventListener('pointermove', (e) => {
      if (dragging) return;
      // hover spotlight intensity
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      spot.position.x = nx * 2.2;
    });

    // Overlay UI — title + CTA
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:18px;pointer-events:none;
    `;
    overlay.innerHTML = `
      <div class="overline" style="pointer-events:none;">${ceremonyMeta.subtitle} · ${ceremonyMeta.subtitleHan}</div>
      <h1 class="title-lg" style="text-align:center;pointer-events:none;">${ceremonyMeta.title}</h1>
      <div class="rule"></div>
      <div class="title-han" style="pointer-events:none;opacity:0.85;">${ceremonyMeta.titleHan}</div>
      <div class="body-han" style="margin-top:6vh;pointer-events:none;opacity:0.65;font-style:italic;font-family:var(--font-latin);letter-spacing:0.3em;">— cliquez pour entrer —</div>
    `;
    container.appendChild(overlay);

    // Position title/CTA to sides so tooth is centered
    gsap.set(overlay.children, { y: 20, opacity: 0 });
    gsap.to(overlay.children, {
      y: 0,
      opacity: 1,
      stagger: 0.18,
      duration: 1.2,
      delay: 1.0,
      ease: 'power2.out'
    });

    // Layout: tooth in middle, title above, button below — but we do it with two overlays
    overlay.style.justifyContent = 'space-between';
    overlay.style.padding = '12vh 0 10vh';

    const btn = document.createElement('button');
    btn.className = 'cta';
    btn.dataset.noAdvance = 'true';
    btn.textContent = 'Entrer · 進入典禮';
    btn.style.pointerEvents = 'auto';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      advance();
    });
    overlay.appendChild(btn);

    onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Render loop
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      currentRotY += (targetRotY - currentRotY) * 0.08;
      if (tooth) {
        tooth.rotation.y = currentRotY + t * 0.12;
        tooth.position.y = Math.sin(t * 0.9) * 0.05;
      }
      renderer.render(scene, camera);
    };
    animate();

    setHUD('Prélude · 登入', '拖曳牙齒旋轉　·　點擊進入');
  }

  function unmount() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
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
