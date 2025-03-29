import p5 from "p5";
import cameraUrl from "../assets/camera.ogg";
import arpUrl from "../assets/arp.ogg";
import {
  audioContext,
  getCurrentBeat,
  getMouseFrames,
  getMousePos,
  mouseConsumed,
  myPreload,
} from "../utils";
import type { Particle } from "./06_play";
import { msPerBeat } from "../consts";

const arpGainNode = audioContext.createGain();
let cameraBuffer: AudioBuffer;
let arpBuffer: AudioBuffer;

const cameraPosition = { x: 296, y: 210 };
const radioPosition = { x: 340, y: 224 };

const particles: Particle[] = [];

export const preload = import.meta.hmrify((p: p5) => {
  myPreload(p, async () => {
    const cameraSound = await fetch(cameraUrl).then((res) => res.arrayBuffer());
    cameraBuffer = await audioContext.decodeAudioData(cameraSound);

    const arpSound = await fetch(arpUrl).then((res) => res.arrayBuffer());
    arpBuffer = await audioContext.decodeAudioData(arpSound);
    arpGainNode.connect(audioContext.destination);
  });
});

export const draw = import.meta.hmrify((p: p5) => {
  if (!cameraBuffer) {
    preload(p);
  }

  const mousePos = getMousePos(p);
  updateCamera(p, mousePos);
  updateArp(p, mousePos);
  updateParticles(p);
});

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    arpGainNode.disconnect();
  });
}

let lastArpSpawnBeat = -1000;
let lastPlayedBeat = -1000;
function updateArp(p: p5, mousePos: { x: number; y: number }) {
  const currentBeat = getCurrentBeat();
  if (currentBeat - lastPlayedBeat >= 16) {
    const source = audioContext.createBufferSource();
    source.buffer = arpBuffer;
    source.connect(arpGainNode);
    source.start(
      0,
      lastPlayedBeat === -1000 ? ((currentBeat % 16) * msPerBeat) / 1000 : 0,
    );
    lastPlayedBeat = Math.floor(currentBeat / 16) * 16;
  }
  const arpDist = distance(radioPosition, { x: mousePos.x, y: mousePos.y });
  if (arpDist < 20) {
    arpGainNode.gain.value = 1 - arpDist / 20;
  } else {
    arpGainNode.gain.value = 0;
  }
  if (currentBeat - lastArpSpawnBeat >= 2) {
    lastArpSpawnBeat = Math.floor(currentBeat / 2) * 2;
    particles.push({
      pos: p.createVector(radioPosition.x, radioPosition.y),
      vel: p.createVector(0, 0),
      size: 20,
      sizeVel: 0.5,
      opacity: 255 * arpGainNode.gain.value,
      remaining: 60,
      initRemaining: 60,
    });
  }
}

function updateCamera(p: p5, mousePos: { x: number; y: number }) {
  const cameraDist = distance(cameraPosition, { x: mousePos.x, y: mousePos.y });
  if (cameraDist < 10 && getMouseFrames() === 1) {
    mouseConsumed.value = true;
    const source = audioContext.createBufferSource();
    source.buffer = cameraBuffer;
    source.connect(audioContext.destination);
    source.start();
    particles.push({
      pos: p.createVector(mousePos.x, mousePos.y),
      vel: p.createVector(0, 0),
      size: 20,
      sizeVel: 0.5,
      opacity: 255,
      remaining: 60,
      initRemaining: 60,
    });
  }
}
function updateParticles(p: p5) {
  for (const [i, particle] of particles.entries()) {
    particle.pos.add(particle.vel);
    particle.remaining -= 1;
    particle.size += particle.sizeVel;

    if (particle.remaining <= 0) {
      particles.splice(i, 1);
    }

    const opacity = Math.round(
      (particle.remaining / particle.initRemaining) * particle.opacity,
    );

    p.stroke(255, 255, 255, opacity);
    p.noFill();
    p.strokeWeight(2);
    p.circle(particle.pos.x, particle.pos.y, particle.size);
  }
}
