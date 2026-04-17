import './style.css';
import { dandelionBlow } from './components/DandelionTransition.js';

import { loginScene } from './scenes/00-login.js';
import { hallScene } from './scenes/01-hall.js';
import { blessingsScene } from './scenes/02-blessings.js';
import { roomScene } from './scenes/03-room.js';
import { oathScene } from './scenes/04-oath.js';
import { groupPhotoScene } from './scenes/05-group-photo.js';
import { revealScene } from './scenes/06-reveal.js';
import { rooms } from './data/ceremony.js';

const app = document.getElementById('app');
const hudChapter = document.getElementById('hud-chapter');
const hudHint = document.getElementById('hud-hint');

// Sequence — each entry has a { factory, chapter, transition } descriptor.
// `transition: 'dandelion'` means play dandelion blow before the scene mounts.
const sequence = [
  { factory: loginScene, chapter: 'Prélude · 登入' },
  { factory: hallScene, chapter: 'I · 大廳', transition: 'dandelion' },
  { factory: blessingsScene, chapter: 'II · 老師祝福', transition: 'fade' },
  ...rooms.map((room) => ({
    factory: () => roomScene(room),
    chapter: `III · ${room.name} ${room.han}`,
    transition: 'dandelion'
  })),
  { factory: oathScene, chapter: 'IV · 牙醫師誓詞', transition: 'fade' },
  { factory: groupPhotoScene, chapter: 'V · 大合照', transition: 'fade' },
  { factory: revealScene, chapter: 'Révélation · 揭曉', transition: 'fade' }
];

let currentIdx = -1;
let currentScene = null;
let isTransitioning = false;

function setHUD(chapter, hint) {
  if (chapter) hudChapter.textContent = chapter;
  if (hint !== undefined) hudHint.textContent = hint;
}

async function goToIndex(idx) {
  if (isTransitioning) return;
  if (idx < 0 || idx >= sequence.length) return;
  isTransitioning = true;

  const entry = sequence[idx];

  if (currentScene) {
    if (entry.transition === 'dandelion') {
      await dandelionBlow();
    }
    try {
      currentScene.unmount?.();
    } catch (e) {
      console.warn('unmount error', e);
    }
    currentScene = null;
  }

  const node = document.createElement('div');
  node.className = 'scene';
  app.innerHTML = '';
  app.appendChild(node);

  const scene = entry.factory();
  currentScene = scene;

  // Each scene exposes { mount, unmount, onAdvance? }
  scene.mount(node, { advance, goBack, setHUD });
  requestAnimationFrame(() => node.classList.add('active'));

  setHUD(entry.chapter);
  currentIdx = idx;
  isTransitioning = false;
}

function advance() {
  // If the current scene handles its own internal step (e.g. room highlights
  // multiple students before leaving), delegate to it first.
  if (currentScene?.onAdvance) {
    const consumed = currentScene.onAdvance();
    if (consumed) return;
  }
  goToIndex(currentIdx + 1);
}

function goBack() {
  if (currentScene?.onBack) {
    const consumed = currentScene.onBack();
    if (consumed) return;
  }
  goToIndex(currentIdx - 1);
}

// Keyboard + click routing
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault();
    advance();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goBack();
  }
});

// Click anywhere advances, but not on the interactive login button or 3D canvas drag.
app.addEventListener('click', (e) => {
  if (e.target.closest('[data-no-advance]')) return;
  // When scene wants clicks (login button), it sets data-no-advance on its interactive bits.
  advance();
});

goToIndex(0);
