// Generates site/meetings.json from the deck content, so the curriculum shown
// on the website can never drift from the slides that are actually built.
import fs from "node:fs/promises";
import { DECKS } from "./content.mjs";

const OUT = "/Users/jada/Documents/New project 2/career-development-deca/site/meetings.json";

const meetings = DECKS.map((deck, i) => {
  const cover = deck.slides.find(([l]) => l === "cover")[1];
  // Rounds and the build carry a time; everything else is a card or an anchor.
  // The agenda the site shows is the activity list, not a list of slide titles.
  const agenda = deck.slides
    .filter(([l]) => l !== "cover" && l !== "sourceLibrary")
    .map(([, p]) => ({ label: p.title ?? p.task, minutes: p.minutes ?? null }));
  const minutes = agenda.reduce((n, a) => n + (a.minutes ?? 0), 0);
  const sources = new Set();
  for (const [layout, props] of deck.slides) {
    if (layout === "sourceLibrary") props.entries.forEach((e) => sources.add(e[0]));
  }
  return {
    number: i + 1,
    title: cover.title.replace(/\n/g, " "),
    summary: cover.sub,
    slideCount: deck.slides.length,
    activeMinutes: minutes,
    agenda,
    sources: [...sources],
    deck: `${deck.file}.pptx`,
  };
});

if (meetings.length !== 7) {
  console.error(`expected 7 meetings, got ${meetings.length}`);
  process.exit(1);
}

if (meetings.some((m) => m.agenda.some((a) => !a.label))) {
  console.error("an agenda item has no label");
  process.exit(1);
}

await fs.writeFile(OUT, `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), meetings }, null, 2)}\n`);
console.log(`wrote meetings.json (${meetings.length} meetings, ${meetings.reduce((n, m) => n + m.agenda.length, 0)} agenda items, ${meetings.reduce((n, m) => n + m.activeMinutes, 0)} timed minutes)`);
