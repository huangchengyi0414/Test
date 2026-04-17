import * as THREE from 'three';
import gsap from 'gsap';
import { createToothMesh } from '../components/ToothMesh.js';

// Reveal scene: camera starts looking "at" the tooth from inside a room (zoomed in),
// then pulls back and out until the whole building-tooth is visible with many windows/doors.
export function revealScene() {
  let renderer, scene, camera, tooth, stars, rafId, onResize;

  function addDoorsAndWindows(toothGroup) {
    // Tooth's bounding is roughly radius 0.7 crown, height 3.6 tip-to-top.
    // We attach decal-style planes on the root surface at various angles.
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1a0f08,
      emissive: 0xb76e79,
      emissiveIntensity: 0.7,
      roughness: 0.4,
      metalness: 0.2
    });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x2a1c10,
      emissive: 0xf4dce0,
      emissiveIntensity: 0.9,
      roughness: 0.3
    });

    const attach = (geom, mat, yNorm, angle, size) => {
      const plane = new THREE.Mesh(geom, mat);
      // Root cross-section radius at y (see ToothMesh.js lathe points):
      // y in [-1.8, -0.2]. Approx r profile: ~0.32 + bulge
      const y = -1.8 + yNorm * 1.6;
      const t = yNorm;
      let r;
      if (t < 0.2) r = 0.05 + t * 1.4;
      else if (t < 0.85) r = 0.32 + Math.sin(t * Math.PI) * 0.15;
      else r = 0.55 + (t - 0.85) * 1.3;
      r += 0.005; // avoid z-fight
      plane.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      plane.lookAt(
        Math.cos(angle) * (r + 1),
        y,
        Math.sin(angle) * (r + 1)
      );
      plane.scale.setScalar(size);
      toothGroup.add(plane);
    };

    const doorGeom = new THREE.PlaneGeometry(0.16, 0.26);
    const winGeomSmall = new THREE.PlaneGeometry(0.09, 0.09);
    const winGeomArch = new THREE.PlaneGeometry(0.1, 0.16);

    // Grand main door near bottom-front
    attach(doorGeom, doorMat, 0.25, 0, 1.1);

    // Row of arched windows
    const rows = [
      { y: 0.42, count: 8, size: 1, geom: winGeomArch },
      { y: 0.58, count: 10, size: 0.9, geom: winGeomSmall },
      { y: 0.72, count: 12, size: 0.8, geom: winGeomSmall }
    ];
    rows.forEach((row) => {
      for (let i = 0; i < row.count; i++) {
        const a = (i / row.count) * Math.PI * 2;
        attach(row.geom, windowMat, row.y, a, row.size);
      }
    });

    // A couple of grand balcony windows on the crown flare
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      attach(winGeomArch, windowMat, 0.82, a, 1.2);
    }
  }

  function mount(container, { setHUD }) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;';
    container.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x05030a, 1);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.06);
    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    // Start INSIDE (near the tooth), then pull way back
    camera.position.set(0, -0.3, 2.2);
    camera.lookAt(0, -0.2, 0);

    // Stars
    const starGeom = new THREE.BufferGeometry();
    const starCount = 1200;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 40 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.14,
      color: 0xf4dce0,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });
    stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    // Light
    scene.add(new THREE.AmbientLight(0x221812, 0.4));
    const spot = new THREE.SpotLight(0xf4dce0, 6, 60, Math.PI / 5, 0.4, 1.4);
    spot.position.set(5, 12, 8);
    spot.target.position.set(0, 0, 0);
    scene.add(spot);
    scene.add(spot.target);

    const goldRim = new THREE.DirectionalLight(0xb76e79, 0.8);
    goldRim.position.set(-6, -2, -4);
    scene.add(goldRim);

    const warmFill = new THREE.PointLight(0xffb07a, 1.2, 30);
    warmFill.position.set(0, 2, 5);
    scene.add(warmFill);

    // The building-tooth
    tooth = createToothMesh({ scale: 3.5 });
    addDoorsAndWindows(tooth);
    scene.add(tooth);

    // Caption intentionally left out — user wants pure 3D reveal for now.

    // Animate the pull-back
    const tl = gsap.timeline();
    tl.to(camera.position, {
      x: 0,
      y: 4,
      z: 26,
      duration: 7.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(0, -0.2, 0)
    });
    tl.to(tooth.rotation, { y: Math.PI * 0.35, duration: 7.5, ease: 'power1.inOut' }, 0);

    onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      stars.rotation.y = t * 0.01;
      renderer.render(scene, camera);
    };
    animate();

    setHUD('Révélation · 揭曉', 'Fin · 謝謝觀賞');
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
