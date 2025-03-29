import p5 from "p5";
import seaUrl from "../assets/sea.png";
import maskUrl from "../assets/mask.png";
import seaSoundUrl from "../assets/sea.ogg";
import commonVert from "../shaders/common.vert?raw";
import maskFrag from "../shaders/mask.frag?raw";
import {
  audioContext,
  getCurrentBeat,
  getMousePos,
  myPreload,
  useDrawingContext,
} from "../utils";
import { clip, easeOutQuart, unlerp } from "../easing";
import { msPerBeat } from "../consts";

let shader: p5.Shader;
let graphics: p5.Graphics;
let seaImage: p5.Image;
let maskImage: p5.Image;
let seaBuffer: AudioBuffer;
let seaSoundGain: GainNode;

const seaWidth = 168;
const seaHeight = 84;

export const preload = import.meta.hmrify((p: p5) => {
  shader = p.createShader(commonVert, maskFrag);
  seaImage = p.loadImage(seaUrl);
  maskImage = p.loadImage(maskUrl);

  seaSoundGain = audioContext.createGain();
  seaSoundGain.connect(audioContext.destination);

  myPreload(p, async () => {
    const buffer = await fetch(seaSoundUrl).then((res) => res.arrayBuffer());
    seaBuffer = await audioContext.decodeAudioData(buffer);
  });
});

export const setup = import.meta.hmrify((p: p5) => {
  graphics = p.createGraphics(p.width, p.height, p.WEBGL);
});

let lastPlayedBeat = -1000;

export const draw = import.meta.hmrify((p: p5) => {
  if (!shader) {
    preload(p);
  }
  if (!graphics) {
    setup(p);
  }

  using _context = useDrawingContext(p);

  const currentBeat = getCurrentBeat();
  if (currentBeat - lastPlayedBeat >= 16) {
    const source = audioContext.createBufferSource();
    source.buffer = seaBuffer;
    source.connect(seaSoundGain);
    source.start(
      lastPlayedBeat === -1000 ? ((currentBeat % 16) * msPerBeat) / 1000 : 0,
    );
    lastPlayedBeat = Math.floor(currentBeat / 16) * 16;
  }

  const seaYRatio = Math.cos((currentBeat / 16) * Math.PI * 2) / 2 + 0.5;

  updateSeaSound(p, seaYRatio);
  drawSea(p, seaYRatio);
});

function drawSea(p: p5, seaYRatio: number) {
  graphics.clear();
  graphics.shader(shader);
  shader.setUniform("u_resolution", [p.width, p.height]);
  shader.setUniform("u_texture", seaImage);
  shader.setUniform("u_mask", maskImage);
  shader.setUniform("u_maskColor", [1, 0, 0, 0]);
  shader.setUniform("u_shift", [0, (-seaYRatio * seaHeight) / p.height]);
  graphics.quad(-1, -1, 1, -1, 1, 1, -1, 1);

  p.image(graphics, 0, 0, p.width, p.height);
}

function updateSeaSound(p: p5, seaYRatio: number) {
  const mousePos = getMousePos(p);
  const seaY = seaYRatio * seaHeight + (p.height - seaHeight);

  const volumeX = 1 - clip(unlerp(seaWidth, p.width, mousePos.x));
  const volumeY = clip(unlerp(0, seaY, mousePos.y));

  seaSoundGain.gain.value = easeOutQuart(Math.min(volumeX, volumeY)) * 0.5;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    seaSoundGain.disconnect();
  });
}
