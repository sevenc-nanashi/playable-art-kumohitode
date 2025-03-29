import fs from "node:fs/promises";
import { defineConfig } from "vite";
import hmrify from "vite-plugin-hmrify";
export default defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [
    hmrify(),
    {
      name: "tonejs-mid",
      async transform(_, id) {
        if (id.endsWith("?mid")) {
          const file = id.replace(/\?mid$/, "");
          this.addWatchFile(file);
          const buffer = await fs.readFile(file);
          return `
          import { Midi } from "@tonejs/midi";

          const buffer = new Uint8Array([${buffer.join(",")}]);
          export const toneJsMidi = new Midi(buffer);
          export default toneJsMidi;
          `;
        }
      },
    },
  ],
});
