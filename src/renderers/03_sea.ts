import p5 from "p5";
import seaUrl from "../assets/sea.png";
import maskUrl from "../assets/mask.png";
import seaSoundUrl from "../assets/sea.ogg";
import commonVert from "../shaders/common.vert?raw";
import maskFrag from "../shaders/mask.frag?raw";
import { getMousePos, myPreload, useDrawingContext } from "../utils";
import { frameRate, framesPerBeat } from "../consts";
import { clip, easeOutQuart, unlerp } from "../easing";

let shader: p5.Shader;
let graphics: p5.Graphics;
let seaImage: p5.Image;
let maskImage: p5.Image;
let seaSound: { value: AudioBufferSourceNode };
let seaSoundGain: GainNode;

let startQueue = false;
const audioContext = new AudioContext();
audioContext.onstatechange = () => {
  if (audioContext.state === "running") {
    console.log("audioContext is running");
    startQueue = false;
  }
};

const seaWidth = 168;
const seaHeight = 84;

export const preload = import.meta.hmrify((p: p5) => {
  shader = p.createShader(commonVert, maskFrag);
  seaImage = p.loadImage(seaUrl);
  maskImage = p.loadImage(maskUrl);

  seaSoundGain = audioContext.createGain();
  seaSoundGain.connect(audioContext.destination);

  seaSound = myPreload(p, async () => {
    const buffer = await fetch(seaSoundUrl).then((res) => res.arrayBuffer());
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.connect(seaSoundGain);
    source.start();

    return source;
  });
});

export const setup = import.meta.hmrify((p: p5) => {
  graphics = p.createGraphics(p.width, p.height, p.WEBGL);
});

export const draw = import.meta.hmrify((p: p5) => {
  if (!shader) {
    preload(p);
  }
  if (!graphics) {
    setup(p);
  }

  using _context = useDrawingContext(p);

  const seqLength = framesPerBeat * 16;
  const currentSeqFrame = p.frameCount % seqLength;

  if (audioContext.state === "suspended" && p.mouseIsPressed && !startQueue) {
    startQueue = true;
    setTimeout(
      () => {
        audioContext.resume();
      },
      (seqLength - currentSeqFrame + framesPerBeat * 2) * (1000 / frameRate),
    );
  }

  const seaYRatio =
    Math.sin((currentSeqFrame / seqLength) * Math.PI * 2) / 2 + 0.5;

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
    try {
      seaSound.value.stop();
    } catch {}

    seaSoundGain.disconnect();

    audioContext.close();
  });
}
