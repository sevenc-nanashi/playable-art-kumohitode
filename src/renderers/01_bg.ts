import p5 from "p5";
import allUrl from "../assets/all.png";

let image: p5.Image;

export const preload = import.meta.hmrify((p: p5) => {
  image = p.loadImage(allUrl);
});

export const draw = import.meta.hmrify((p: p5) => {
  if (!image) {
    preload(p);
  }
  p.background(255);
  p.stroke(255);
  p.image(image, 0, 0, p.width, p.height);
});
