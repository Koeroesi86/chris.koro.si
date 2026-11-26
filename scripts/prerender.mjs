// Writes the server-rendered page and its metadata into the built index.html.
import { readFile, writeFile } from 'node:fs/promises';
import { renderBody, renderHead } from '../dist-ssr/entry-server.mjs';

const file = new URL('../dist/index.html', import.meta.url);

const insert = (html, marker, content) => {
  if (!html.includes(marker)) throw new Error(`prerender: ${marker} not found in dist/index.html`);
  return html.replace(marker, () => content);
};

const withHead = insert(await readFile(file, 'utf8'), '</head>', `${renderHead()}</head>`);

await writeFile(file, insert(withHead, '<div id="root"></div>', `<div id="root">${renderBody()}</div>`));
