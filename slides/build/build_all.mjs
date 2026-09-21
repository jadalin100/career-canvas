// Builds every Career Canvas meeting deck from content.mjs through one shared
// layout kit, so all seven stay visually identical. Run: node build_all.mjs [n]
import { execFileSync } from "node:child_process";
import { makeDeckBuilder, finalize } from "./deck_kit.mjs";
import { DECKS, ACCESSED } from "./content.mjs";

const only = process.argv[2] ? Number(process.argv[2]) : null;
const results = [];

for (const [i, deck] of DECKS.entries()) {
  if (only && i + 1 !== only) continue;
  const { pres, layouts } = makeDeckBuilder();
  for (const [layout, props] of deck.slides) {
    const fn = layouts[layout];
    if (!fn) throw new Error(`${deck.file}: unknown layout "${layout}"`);
    await fn(layout === "sourceLibrary" ? { accessed: ACCESSED, ...props } : props);
  }
  const { finalPath, result } = await finalize({ pres, slideCount: deck.slides.length, fileName: deck.file });
  results.push({ deck: deck.file, slides: deck.slides.length, finalPath, ok: result?.ok ?? result });
  console.log(`built ${deck.file} (${deck.slides.length} slides)`);
}

// One runnable check: every content slide must carry a source line, and every
// deck must end with a source library. This is the citation bar for the set.
let failures = 0;
for (const deck of DECKS) {
  const last = deck.slides.at(-1)[0];
  if (last !== "sourceLibrary") { console.error(`FAIL ${deck.file}: last slide is ${last}, not sourceLibrary`); failures++; }
  deck.slides.forEach(([layout, props], i) => {
    if (layout === "cover" || layout === "sourceLibrary") return;
    if (!props.source) { console.error(`FAIL ${deck.file} slide ${i + 1} (${layout}): no source line`); failures++; }
  });
}
console.log(failures ? `\n${failures} citation failures` : "\ncitation check passed: every content slide has a source line");
if (failures) process.exit(1);

// Palette, no-images and on-canvas checks run against the built files, not the
// content, so a layout change cannot quietly reintroduce an off-brand color.
if (!only) {
  console.log(execFileSync("python3", ["check_decks.py"], { cwd: import.meta.dirname }).toString().trim());
}
