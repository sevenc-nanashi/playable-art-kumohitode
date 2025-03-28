import tonejsMidi from "@tonejs/midi";
import fs from "node:fs/promises";
import { $ } from "zx";

const source = process.argv[2];
const midiPath = process.argv[3];
const outputPath = process.argv[4];

const midi = new tonejsMidi.Midi(await fs.readFile(midiPath));
const track = midi.tracks.find((track) => track.name === "keys");
if (!track) {
  throw new Error("Track not found");
}

$.verbose = true;
for (const note of track.notes) {
  const startTime = note.time;
  const length = note.duration;

  await $`ffmpeg -i ${source} -ss ${startTime} -t ${length} ${outputPath}/${note.midi}.ogg -y`;
}
