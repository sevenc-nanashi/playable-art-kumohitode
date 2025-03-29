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

const arpGainNode = audioContext.createGain();
let cameraBuffer: AudioBuffer;
let arpBuffer: AudioBuffer;

const cameraPosition = { x: 296, y: 210 };
const radioPosition = { x: 340, y: 224 };

export const preload = import.meta.hmrify((p: p5) => {
  myPreload(p, async () => {
    const cameraSound = await fetch(cameraUrl).then((res) => res.arrayBuffer());
    cameraBuffer = await audioContext.decodeAudioData(cameraSound);

    const arpSound = await fetch(arpUrl).then((res) => res.arrayBuffer());
    arpBuffer = await audioContext.decodeAudioData(arpSound);
    arpGainNode.connect(audioContext.destination);
  });
});

let lastPlayedBeat = -1000;

export const draw = import.meta.hmrify((p: p5) => {
  if (!cameraBuffer) {
    preload(p);
  }

  const mousePos = getMousePos(p);
  updateCamera(mousePos);
  updateArp(mousePos);
});

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    arpGainNode.disconnect();
  });
}
function updateArp(mousePos: { x: number; y: number }) {
  const currentBeat = getCurrentBeat();
  if (currentBeat - lastPlayedBeat >= 16) {
    const source = audioContext.createBufferSource();
    source.buffer = arpBuffer;
    source.connect(arpGainNode);
    source.start();
    lastPlayedBeat = currentBeat;
  }
  const arpDist = distance(radioPosition, { x: mousePos.x, y: mousePos.y });
  if (arpDist < 20) {
    arpGainNode.gain.value = 1 - arpDist / 20;
  } else {
    arpGainNode.gain.value = 0;
  }
}

function updateCamera(mousePos: { x: number; y: number }) {
  const cameraDist = distance(cameraPosition, { x: mousePos.x, y: mousePos.y });
  if (cameraDist < 10 && getMouseFrames() === 1) {
    mouseConsumed.value = true;
    const source = audioContext.createBufferSource();
    source.buffer = cameraBuffer;
    source.connect(audioContext.destination);
    source.start();
  }
}
