import p5 from "p5";
import seq from "../assets/seq.mid?mid";
import { audioContext, getMousePos, mouseConsumed, myPreload } from "../utils";

const keysToAudioBuffer: Record<number, AudioBuffer> = {};
const backupKeysNode: Record<number, AudioBufferSourceNode> = {};
const urls = import.meta.glob<string>("../assets/keys/*.ogg", {
  eager: true,
  query: "?url",
  import: "default",
});

type Particle = {
  pos: p5.Vector;
  vel: p5.Vector;
  size: number;
  sizeVel: number;
  remaining: number;
  initRemaining: number;
  opacity: number;
};
const particles: Particle[] = [];

const seqTrack = seq.tracks.find((track) => track.name === "seq")!;

const gainNode = audioContext.createGain();
gainNode.gain.value = 0.5;
gainNode.connect(audioContext.destination);

export const preload = import.meta.hmrify((p: p5) => {
  myPreload(p, async () => {
    for (const [key, url] of Object.entries(urls)) {
      const buffer = await fetch(url).then((res) => res.arrayBuffer());
      const keyInt = parseInt(key.match(/(\d+)/)![0]);

      keysToAudioBuffer[keyInt] = await audioContext.decodeAudioData(buffer);

      const source = audioContext.createBufferSource();
      source.buffer = keysToAudioBuffer[keyInt];
      source.connect(gainNode);
      backupKeysNode[keyInt] = source;
    }
  });
});

let clickFrames = 0;
let seqIndex = -1;

export const draw = import.meta.hmrify((p: p5) => {
  if (!keysToAudioBuffer[60]) {
    preload(p);
  }

  if (p.mouseIsPressed) {
    clickFrames += 1;
  } else {
    clickFrames = 0;
  }

  const mousePos = getMousePos(p);

  if (p.mouseIsPressed && clickFrames === 1 && !mouseConsumed.value) {
    mouseConsumed.value = true;
    seqIndex += 1;
    seqIndex %= seqTrack.notes.length;

    const note = seqTrack.notes[seqIndex];
    backupKeysNode[note.midi].start();

    const newNode = audioContext.createBufferSource();
    newNode.buffer = keysToAudioBuffer[note.midi];
    newNode.connect(gainNode);
    backupKeysNode[note.midi] = newNode;

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

  for (const [i, particle] of particles.entries()) {
    particle.pos.add(particle.vel);
    particle.remaining -= 1;
    particle.size += particle.sizeVel;

    if (particle.remaining <= 0) {
      particles.splice(i, 1);
    }

    const opacity = Math.round(
      (particle.remaining / particle.initRemaining) * 255,
    );

    p.stroke(255, 255, 255, opacity);
    p.noFill();
    p.strokeWeight(2);
    p.square(
      particle.pos.x - particle.size / 2,
      particle.pos.y - particle.size / 2,
      particle.size,
    );
  }
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    gainNode.disconnect();
  });
}
