import p5 from "p5";
import seaUrl from "../assets/sea.png";
import maskUrl from "../assets/mask.png";
import seaSoundUrl from "../assets/sea.ogg";
import commonVert from "../shaders/common.vert?raw";
import maskFrag from "../shaders/mask.frag?raw";
import { myPreload, useDrawingContext } from "../utils";
import { framesPerBeat } from "../consts";

let shader: p5.Shader;
let graphics: p5.Graphics;
let seaImage: p5.Image;
let maskImage: p5.Image;
let seaSound = new Audio(seaSoundUrl);

const seaHeight = 84;

export const preload = import.meta.hmrify((p: p5) => {
  shader = p.createShader(commonVert, maskFrag);
  seaImage = p.loadImage(seaUrl);
  maskImage = p.loadImage(maskUrl);

  myPreload(p, () => {
    const { promise, resolve } = Promise.withResolvers<void>();
    seaSound.oncanplay = () => resolve();
    if (seaSound.readyState >= 4) {
      resolve();
    }
    return promise;
  });
});

export const setup = import.meta.hmrify((p: p5) => {
  graphics = p.createGraphics(p.width, p.height, p.WEBGL);
  seaSound.loop = true;
});

export const draw = import.meta.hmrify((p: p5) => {
  if (!shader) {
    preload(p);
  }
  if (!graphics) {
    setup(p);
  }

  if (seaSound.paused) {
    seaSound.play();
  }

  using _context = useDrawingContext(p);

  const seqLength = framesPerBeat * 16;
  const currentSeqFrame = p.frameCount % seqLength;
  const y = Math.sin((currentSeqFrame / seqLength) * Math.PI * 2) / 2 + 0.5;

  graphics.clear();
  graphics.shader(shader);
  shader.setUniform("u_resolution", [p.width, p.height]);
  shader.setUniform("u_texture", seaImage);
  shader.setUniform("u_mask", maskImage);
  shader.setUniform("u_maskColor", [1, 0, 0, 0]);
  shader.setUniform("u_shift", [0, -y * (seaHeight / p.height)]);
  graphics.quad(-1, -1, 1, -1, 1, 1, -1, 1);

  p.image(graphics, 0, 0, p.width, p.height);
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    seaSound.pause();
  });
}
