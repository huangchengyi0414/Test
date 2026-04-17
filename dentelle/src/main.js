import './style.css';
import { dandelionBlow } from './components/DandelionTransition.js';

import { loginScene } from './scenes/00-login.js';
import { hallScene } from './scenes/01-hall.js';
import { dentelleIntroScene } from './scenes/02-dentelle-intro.js';
import { vicePresidentScene } from './scenes/03-vice-president.js';
import { dignitarySpeechScene } from './scenes/04-dignitary-speech.js';
import { guestIntroScene } from './scenes/05-guest-intro.js';
import { blessingVideoScene } from './scenes/06-blessing-video.js';
import { roomScene } from './scenes/07-room.js';
import { studentSpeechScene } from './scenes/08-student-speech.js';
import { oathScene } from './scenes/09-oath.js';
import { groupPhotoScene } from './scenes/10-group-photo.js';
import { revealScene } from './scenes/11-reveal.js';
import { rooms } from './data/ceremony.js';

const app = document.getElementById('app');
const hudChapter = document.getElementById('hud-chapter');
const hudHint = document.getElementById('hud-hint');

const sequence = [
  { factory: loginScene, chapter: 'Prélude · 登入' },
  { factory: hallScene, chapter: 'I · 典禮開始前', transition: 'dandelion' },
  { factory: dentelleIntroScene, chapter: 'II · Dentelle 之意', transition: 'fade' },
  { factory: vicePresidentScene, chapter: 'III · 副院長致詞', transition: 'fade' },
  { factory: dignitarySpeechScene, chapter: 'IV · 來賓致詞', transition: 'fade' },
  { factory: guestIntroScene, chapter: 'V · 與會師長', transition: 'dandelion' },
  { factory: blessingVideoScene, chapter: 'VI · 師長祝福', transition: 'fade' },
  ...rooms.map((room) => ({
    factory: () => roomScene(room),
    chapter: `${room.roman} · ${room.han}`,
    transition: 'dandelion'
  })),
  { factory: studentSpeechScene, chapter: 'VII · 在校生致辭', transition: 'dandelion' },
  { factory: oathScene, chapter: 'VIII · 醫師宣誓', transition: 'fade' },
  { factory: groupPhotoScene, chapter: 'IX · 大合照', transition: 'fade' },
  { factory: revealScene, chapter: 'Révélation · 揭曉', transition: 'fade' }
];

let currentIdx = -1;
let currentScene = null;
let isTransitioning = false;

function setHUD(chapter, hint) {
  if (chapter && hudChapter) hudChapter.textContent = chapter;
  if (hint !== undefined && hudHint) hudHint.textContent = hint;
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

  scene.mount(node, { advance, goBack, setHUD });
  requestAnimationFrame(() => node.classList.add('active'));

  setHUD(entry.chapter);
  currentIdx = idx;
  isTransitioning = false;
}

function advance() {
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

window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault();
    advance();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goBack();
  }
});

app.addEventListener('click', (e) => {
  if (e.target.closest('[data-no-advance]')) return;
  advance();
});

goToIndex(0);
