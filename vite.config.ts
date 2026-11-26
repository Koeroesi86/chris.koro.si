import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const escapeCharacter = (character: string) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`;

/**
 * The web server guesses a script's charset from its beginning and labels it us-ascii when accented
 * letters only appear further on, which garbles them. Shipping them as escapes avoids the guess.
 */
const asciiScripts = (): Plugin => ({
  name: 'ascii-scripts',
  // Runs on the final, minified code, exactly as it is written to disk.
  generateBundle: (_options, bundle) =>
    Object.values(bundle)
      .filter((file) => file.type === 'chunk')
      .forEach((chunk) => {
        chunk.code = chunk.code.replace(/[^\x00-\x7f]/g, escapeCharacter);
      }),
});

export default defineConfig({
  plugins: [react(), asciiScripts()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
