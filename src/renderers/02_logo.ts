import p5 from "p5";
import logoUrl from "../assets/logo.png";
import misakiGothic from "../assets/misaki_gothic.ttf";
import { getMousePos, getTopLeft } from "../utils";
import { clip, easeOutQuart, rightClip, unlerp } from "../easing";
import { framesPerBeat } from "../consts";
import { useDrawingContext } from "../utils";
import { shadowColor } from "../colors";

let image: p5.Image;
let font: p5.Font;

const logoWidth = 108;
const logoHeight = 62;
const logoPadding = 5;

export const preload = import.meta.hmrify((p: p5) => {
  font = p.loadFont(misakiGothic);
  image = p.loadImage(logoUrl);
});

export const draw = import.meta.hmrify((p: p5) => {
  if (!image) {
    preload(p);
  }
  using _context = useDrawingContext(p);

  const topLeft = getTopLeft(p);
  p.translate(topLeft.x, topLeft.y);
  p.noStroke();

  drawLogo(p);

  {
    using _context = useDrawingContext(p);
    p.translate(1, 1);
    p.fill(...shadowColor);
    drawText(p);
  }

  p.fill(255);
  drawText(p, { interactive: true, x: topLeft.x, y: topLeft.y });
});
function drawLogo(p: p5) {
  using _context = useDrawingContext(p);
  const progress = clip(unlerp(0, framesPerBeat * 4, p.frameCount));
  const originX =
    Math.round((easeOutQuart(progress) - 1) * (logoWidth + logoPadding)) +
    logoPadding;
  const originY = logoPadding;
  p.image(image, originX, originY);

  if (p.mouseIsPressed) {
    mouseFrames += 1;
  } else {
    mouseFrames = 0;
  }

  p.fill(...shadowColor);
  p.rect(0, originY + logoHeight + 1, originX + logoWidth + 1, 2);

  p.fill(255);
  p.rect(0, originY + logoHeight, originX + logoWidth, 2);
}

type Line = { text: string; url: string };
const lines: Line[] = [
  { text: "原作: 海茶", url: "https://www.youtube.com/watch?v=dPQRX8V0QvQ" },
  {
    text: "アイデア元: るねつき",
    url: "https://scratch.mit.edu/projects/1151639451/",
  },
  {
    text: "プログラム、イラスト: 名無し。",
    url: "https://github.com/sevenc-nanashi/playable-art-kumohitode",
  },
];

let mouseFrames = 0;
function drawText(
  p: p5,
  args: { interactive?: boolean; x?: number; y?: number } = {},
) {
  using _context = useDrawingContext(p);

  const fontSize = 8;
  p.textSize(fontSize);
  p.textFont(font);
  p.textAlign(p.LEFT, p.TOP);

  const mousePos = getMousePos(p);

  for (const [i, line] of lines.entries()) {
    using _context = useDrawingContext(p);
    const progress = rightClip(
      unlerp(0, framesPerBeat * 8, p.frameCount) - 0.1 * i,
    );
    const originX =
      Math.round((easeOutQuart(progress) - 1) * (logoWidth + logoPadding)) +
      logoPadding;
    const originY = logoPadding + logoHeight + 4 + i * (fontSize + 2);

    if (args.interactive && args.x !== undefined && args.y !== undefined) {
      const width = p.textWidth(line.text);

      if (
        mousePos.x >= args.x + originX &&
        mousePos.x <= args.x + originX + width &&
        mousePos.y >= args.y + originY &&
        mousePos.y <= args.y + originY + fontSize
      ) {
        p.fill(255, 255, 255, 192);
        if (mouseFrames === 1) {
          console.log(line.url);
          window.open(line.url, "_blank");
        }
      }
    }
    p.text(line.text, originX, originY);
  }
}
