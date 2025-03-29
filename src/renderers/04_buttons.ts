import p5 from "p5";
import buttonsUrl from "../assets/buttons.png";
import {
  audioContext,
  getBottomLeft,
  getMouseFrames,
  getMousePos,
  mouseConsumed,
  myPreload,
  useDrawingContext,
} from "../utils";
import { akaneColor, aoiColor, shadowColor } from "../colors";
import kickSoundUrl from "../assets/kick.ogg";
import snareSoundUrl from "../assets/snare.ogg";
import dialSoundUrl from "../assets/dial.ogg";

let image: p5.Image;
let kickSoundBuffer: AudioBuffer;
let snareSoundBuffer: AudioBuffer;
let dialSoundBuffer: AudioBuffer;

const originalButtonSize = 24;
const originalButtonPadding = 8;

const buttonSize = 24;
const buttonPadding = 5;
const buttonGap = 4;

const gainNode = audioContext.createGain();
gainNode.gain.value = 0.5;
gainNode.connect(audioContext.destination);

type ButtonState = "neutral" | "active" | "disabled";

const buttonNames = ["kick", "snare", "dial"] as const;
type ButtonName = (typeof buttonNames)[number];
const buttonStates: Record<ButtonName, ButtonState> = {
  kick: "neutral",
  snare: "neutral",
  dial: "neutral",
};

export const preload = import.meta.hmrify((p: p5) => {
  image = p.loadImage(buttonsUrl);

  myPreload(p, async () => {
    const kickSound = await fetch(kickSoundUrl).then((res) =>
      res.arrayBuffer(),
    );
    kickSoundBuffer = await audioContext.decodeAudioData(kickSound);

    const snareSound = await fetch(snareSoundUrl).then((res) =>
      res.arrayBuffer(),
    );
    snareSoundBuffer = await audioContext.decodeAudioData(snareSound);

    const dialSound = await fetch(dialSoundUrl).then((res) =>
      res.arrayBuffer(),
    );
    dialSoundBuffer = await audioContext.decodeAudioData(dialSound);
  });
});

export const draw = import.meta.hmrify((p: p5) => {
  if (!image) {
    preload(p);
  }

  const bottomLeft = getBottomLeft(p);

  const mousePos = getMousePos(p);

  const hoveredButton = getHoveredButton(bottomLeft, mousePos);

  drawButtons(p, bottomLeft, hoveredButton);
});

function drawButtons(
  p: p5,
  bottomLeft: { x: number; y: number },
  hoveredButton: ButtonName | undefined,
) {
  const mouseFrames = getMouseFrames();
  for (let i = 0; i < buttonNames.length; i++) {
    using _context = useDrawingContext(p);
    const imageX = i * (originalButtonSize + originalButtonPadding);
    const imageY = image.height - originalButtonSize;

    const x = bottomLeft.x + i * (buttonSize + buttonGap) + buttonPadding;
    const y = bottomLeft.y - buttonSize - buttonPadding;

    const isClicking = mouseFrames > 0 && hoveredButton === buttonNames[i];
    if (!isClicking) {
      using _context = useDrawingContext(p);
      p.tint(...shadowColor);
      p.image(
        image,
        x + 1,
        y,
        buttonSize,
        buttonSize,
        imageX,
        imageY,
        originalButtonSize,
        originalButtonSize,
      );
    }
    if (buttonStates[buttonNames[i]] === "disabled") {
      p.tint(255, 128);
    } else if (mouseFrames === 1 && hoveredButton === buttonNames[i]) {
      onButtonPress(buttonNames[i]);
      mouseConsumed.value = true;
    }
    if (buttonStates[buttonNames[i]] === "active") {
      if (i % 2 === 0) {
        p.tint(...akaneColor.light);
      } else {
        p.tint(...aoiColor.light);
      }
    }
    let yShiftAmount = hoveredButton === buttonNames[i] ? 2 : 1;
    if (isClicking) {
      yShiftAmount = 0;
    }
    p.image(
      image,
      x,
      y - yShiftAmount,
      buttonSize,
      buttonSize,
      imageX,
      imageY,
      originalButtonSize,
      originalButtonSize,
    );
  }
}

function getHoveredButton(
  bottomLeft: { x: number; y: number },
  mousePos: { x: number; y: number },
) {
  return buttonNames.find((_name, i) => {
    const x = bottomLeft.x + i * (buttonSize + buttonGap) + buttonPadding;
    const y = bottomLeft.y - buttonSize - buttonPadding;
    return (
      x <= mousePos.x &&
      mousePos.x <= x + buttonSize &&
      y <= mousePos.y &&
      mousePos.y <= y + buttonSize
    );
  });
}

//function drawAround(
//  p: p5,
//  image: p5.Image,
//  x: number,
//  y: number,
//  dw: number,
//  dh: number,
//  sx: number,
//  sy: number,
//  sw: number,
//  sh: number,
//) {
//  for (let dx = -1; dx <= 1; dx++) {
//    for (let dy = -1; dy <= 1; dy++) {
//      if (dx === 0 && dy === 0) {
//        continue;
//      }
//      p.image(image, x + dx, y + dy, dw, dh, sx, sy, sw, sh);
//    }
//  }
//}

function onButtonPress(button: ButtonName) {
  if (buttonStates[button] === "disabled") {
    return;
  }

  buttonStates[button] = "active";
  setTimeout(() => {
    buttonStates[button] = "neutral";
  }, 100);

  if (button === "kick") {
    playSound(kickSoundBuffer);
  } else if (button === "snare") {
    playSound(snareSoundBuffer);
  } else if (button === "dial") {
    playSound(dialSoundBuffer);
  }
}

function playSound(buffer: AudioBuffer) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(gainNode);
  source.start();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    gainNode.disconnect();
  });
}
