import p5 from "p5";

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
