import p5 from "p5";
import { msPerBeat } from "./consts";

export const useDrawingContext = (target: {
  push: () => void;
  pop: () => void;
}) => {
  target.push();
  return {
    [Symbol.dispose]() {
      target.pop();
    },
  };
};

export const myPreload = <T>(p: p5, fn: () => Promise<T>): { value: T } => {
  // @ts-expect-error internal API
  p._incrementPreload();
  const resultValue = { value: null as unknown as T };
  fn().then((value) => {
    resultValue.value = value;
    // @ts-expect-error internal API
    p._decrementPreload();
  });

  return resultValue;
};

export const getTopLeft = (p: p5) => {
  const windowRatio = window.innerWidth / window.innerHeight;
  const canvasRatio = p.width / p.height;
  // canvasはcoverで表示される
  if (windowRatio > canvasRatio) {
    return {
      x: 0,
      y: Math.floor((p.width / windowRatio - p.height) / -2),
    };
  } else {
    return {
      x: Math.floor((p.height * windowRatio - p.width) / -2),
      y: 0,
    };
  }
};

export const getBottomLeft = (p: p5) => {
  const { x, y } = getTopLeft(p);
  return { x, y: p.height - y };
};

export const getTopRight = (p: p5) => {
  const { x, y } = getTopLeft(p);
  return { x: p.width - x, y };
};

export const getBottomRight = (p: p5) => {
  const { x, y } = getTopLeft(p);
  return { x: p.width - x, y: p.height - y };
};

export const getMousePos = (p: p5) => {
  const windowX = p.mouseX / p.width;
  const windowY = p.mouseY / p.height;

  const canvasRatio = p.width / p.height;
  const windowRatio = window.innerWidth / window.innerHeight;

  const larger = Math.max(canvasRatio / windowRatio, windowRatio / canvasRatio);

  const topLeft = getTopLeft(p);

  if (windowRatio > canvasRatio) {
    return {
      x: windowX * p.width,
      y: (windowY * p.height) / larger + topLeft.y,
    };
  } else {
    return {
      x: (windowX * p.width) / larger + topLeft.x,
      y: windowY * p.height,
    };
  }
};

let baseMs: number;
export const setBaseMs = () => {
  baseMs = performance.now();
};
export const getCurrentBeat = () => {
  return (performance.now() - baseMs) / msPerBeat;
};

let mouseFrames = 0;
export const updateMouseFrames = (p: p5) => {
  if (p.mouseIsPressed) {
    mouseFrames += 1;
  } else {
    mouseFrames = 0;
  }
};

export const mouseConsumed = { value: false };

export const getMouseFrames = () => {
  return mouseFrames;
};

export const audioContext = new AudioContext();
