/// <reference types="vite/client" />
/// <reference types="vite-plugin-hmrify/client" />
/// <reference types="p5.sound" />

declare module "*?mid" {
  import { Midi } from "@tonejs/midi";
  const toneJsMidi: Midi;
  export default toneJsMidi;
}
