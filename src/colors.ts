export const shadowColor = [174, 170, 211, 255 * 0.45] as const;

export const akaneColor: CharaColor = {
  light: [255, 213, 226, 255],
  dark: [234, 113, 153, 255],
};
export const aoiColor: CharaColor = {
  light: [195, 243, 255, 255],
  dark: [40, 163, 187, 255],
};

export type Color = [number, number, number, number];
export type CharaColor = {
  light: Color;
  dark: Color;
};
