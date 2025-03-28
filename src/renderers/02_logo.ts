import p5 from "p5";
import logoUrl from "../assets/logo.png";
import misakiGothic from "../assets/misaki_gothic.ttf";
import { getTopLeft } from "../utils";
import { clip, easeOutQuart, rightClip, unlerp } from "../easing";
import { framesPerBeat, shadowColor } from "../consts";
import { useDrawingContext } from "../utils";

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
  drawText(p);
});
function drawLogo(p: p5) {
  using _context = useDrawingContext(p);
  const progress = clip(unlerp(0, framesPerBeat * 4, p.frameCount));
  const originX =
    Math.round((easeOutQuart(progress) - 1) * (logoWidth + logoPadding)) +
    logoPadding;
  const originY = logoPadding;
  p.image(image, originX, originY);

  p.fill(...shadowColor);
  p.rect(0, originY + logoHeight + 1, originX + logoWidth + 1, 2);

  p.fill(255);
  p.rect(0, originY + logoHeight, originX + logoWidth, 2);
}

function drawText(p: p5) {
  using _context = useDrawingContext(p);

  const fontSize = 8;
  p.textSize(fontSize);
  p.textFont(font);
  p.textAlign(p.LEFT, p.TOP);

  for (const [i, line] of [
    "原作: 海茶",
    "アイデア元: るねつき",
    "プログラム、イラスト: 名無し。",
  ].entries()) {
    const progress = rightClip(
      unlerp(0, framesPerBeat * 8, p.frameCount) - 0.1 * i,
    );
    const originX =
      Math.round((easeOutQuart(progress) - 1) * (logoWidth + logoPadding)) +
      logoPadding;
    const originY = logoPadding + logoHeight + 4 + i * (fontSize + 2);

    p.text(line, originX, originY);
  }
}
