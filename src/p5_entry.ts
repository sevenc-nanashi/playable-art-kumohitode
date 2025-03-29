import "@hazae41/symbol-dispose-polyfill";
import { frameRate, height, width } from "./consts";
import p5 from "p5";
import { mouseConsumed, setBaseMs, updateMouseFrames } from "./utils";

const modules = import.meta.glob<{
  preload?: (p: p5) => void;
  setup?: (p: p5) => void;
  draw?: (p: p5) => void;
}>("./renderers/*.ts", { eager: true });

new p5((p: p5) => {
  p.preload = () => {
    for (const key in modules) {
      modules[key].preload?.(p);
    }
  };
  p.setup = () => {
    p.createCanvas(width, height);
    p.frameRate(frameRate);
    for (const key in modules) {
      modules[key].setup?.(p);
    }

    setBaseMs();
  };

  p.draw = () => {
    p.noSmooth();
    updateMouseFrames(p);
    mouseConsumed.value = false;
    for (const key in modules) {
      modules[key].draw?.(p);
    }
  };
});
