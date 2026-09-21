// Shared layout kit for every Career Canvas meeting deck.
// Layouts are the only way slides get made, so all seven decks stay identical
// in type scale, margins, and footer/citation treatment.
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const SKILL_DIR = "/Users/jada/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations";
export const WORKSPACE_DIR = "/Users/jada/Documents/New project 2/career-development-deca/slides";
export const OUTPUT_DIR = path.join(WORKSPACE_DIR, "output");
const BUILD_DIR = path.join(WORKSPACE_DIR, ".build");
const RUNTIME_PYTHON = "/Users/jada/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href,
);
// The macOS host does not expose a runtime font inventory, so name the
// installed family explicitly. Matches the font in the existing Meeting 1 deck.
export const FONT = resolvePresentationFont({ availableFonts: ["Helvetica Neue", "Helvetica", "Arial"] });

// Career Canvas palette. Five brand colors, no outside hues: the decks used to
// tell the five DECA areas apart by hue, which a mono-blue palette cannot do,
// so identity now comes from the round numbers instead.
export const C = {
  deep: "#0F1A2B",    // Deep Navy   - dark slide backgrounds
  navy: "#1C2E4A",    // Midnight Blue - headings, accent bars, dark cards
  blue: "#52677D",    // Dusty Blue  - kickers, secondary text, numerals
  ivory: "#BDC4D4",   // Ivory       - rules, ghost type, dark-slide body text
  cream: "#D1CFC9",   // Buttercream - the highlight: badges, labels, light cards
  white: "#FFFFFF",
  ink: "#0F1A2B",
  muted: "#52677D",
  line: "#BDC4D4",
  // Back-compat aliases so older call sites keep resolving to palette colors.
  sky: "#BDC4D4",
  pale: "#D1CFC9",
  yellow: "#D1CFC9",
  coral: "#52677D",
  teal: "#52677D",
  violet: "#1C2E4A",
};

export function makeDeckBuilder() {
  const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  let n = 0;

  const shape = (slide, left, top, width, height, fill, geometry = "rect", lineFill = "none", lineWidth = 0) =>
    slide.shapes.add({ geometry, position: { left, top, width, height }, fill, line: { fill: lineFill, width: lineWidth } });

  function text(slide, value, left, top, width, height, opts = {}) {
    const box = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { fill: "none", width: 0 } });
    box.text = value;
    box.text.style = {
      typeface: FONT,
      fontSize: opts.fontSize ?? 24,
      bold: opts.bold ?? false,
      color: opts.color ?? C.ink,
      alignment: opts.alignment ?? "left",
      verticalAlignment: opts.verticalAlignment ?? "top",
      autoFit: "none",
    };
    return box;
  }

  function header(slide, kicker, title, sub = "", onDark = false) {
    text(slide, kicker.toUpperCase(), 72, 44, 520, 28, { fontSize: 15, bold: true, color: onDark ? C.yellow : C.blue });
    const size = title.length > 62 ? 30 : title.length > 46 ? 34 : 38;
    text(slide, title, 72, 78, 1120, 66, { fontSize: size, bold: true, color: onDark ? C.white : C.navy });
    if (sub) text(slide, sub, 72, 146, 1110, 46, { fontSize: 19, color: onDark ? C.sky : C.muted });
  }

  function footer(slide, sourceLabel = "", onDark = false) {
    shape(slide, 72, 676, 1136, 1, onDark ? C.blue : C.line);
    if (sourceLabel) text(slide, sourceLabel, 102, 682, 970, 22, { fontSize: 10, color: onDark ? C.sky : C.muted });
    text(slide, String(n).padStart(2, "0"), 1145, 682, 62, 20, { fontSize: 11, bold: true, color: onDark ? C.yellow : C.blue, alignment: "right" });
  }

  function notes(slide, teaching, sources = []) {
    const tail = sources.length ? `\n\nSources:\n${sources.map((s) => `- ${s}`).join("\n")}` : "";
    slide.speakerNotes.textFrame.setText(`${teaching}${tail}`);
  }

  function newSlide(fill) {
    const slide = pres.slides.add();
    slide.background.fill = fill;
    n += 1;
    return slide;
  }

  // ---------- layouts ----------

  // Ranked-list figure. Bar length encodes rank only, which is why the axis is
  // labelled Rank and no percentages are invented for the rows.
  function rankLadder(slide, x, y, w, items, highlight) {
    const rowH = 36;
    items.forEach(([rank, name], i) => {
      const top = y + i * rowH;
      const on = rank === highlight;
      const barW = Math.round((w - 232) * ((items.length - i) / items.length));
      shape(slide, x, top + 4, 26, 24, on ? C.cream : "none", "roundRect");
      text(slide, String(rank), x, top + 8, 26, 20, { fontSize: 13, bold: true, color: on ? C.navy : C.blue, alignment: "center" });
      text(slide, name, x + 36, top + 5, 196, 26, { fontSize: on ? 13 : 12, bold: on, color: on ? C.navy : C.blue });
      shape(slide, x + 240, top + 11, barW, 10, on ? C.navy : C.ivory, "roundRect");
    });
  }

  // Grouped bars for a two-condition, three-interval result.
  function groupedBars(slide, x, y, w, h, groups, series) {
    const max = Math.max(...groups.flatMap((g) => g.values));
    const gw = w / groups.length;
    shape(slide, x, y + h, w, 2, C.ivory);
    groups.forEach((g, gi) => {
      g.values.forEach((v, si) => {
        const bh = Math.round((v / max) * h);
        const bw = 52;
        const bx = x + gi * gw + gw / 2 - bw - 8 + si * (bw + 16);
        shape(slide, bx, y + h - bh, bw, bh, si === 0 ? C.blue : C.navy, "roundRect");
        text(slide, `${v}%`, bx - 8, y + h - bh - 32, bw + 16, 26, { fontSize: 17, bold: true, color: C.navy, alignment: "center" });
      });
      text(slide, g.label, x + gi * gw, y + h + 14, gw, 26, { fontSize: 15, bold: true, color: C.navy, alignment: "center" });
    });
    series.forEach((name, i) => {
      shape(slide, x + i * 250, y + h + 56, 16, 16, i === 0 ? C.blue : C.navy, "roundRect");
      text(slide, name, x + i * 250 + 26, y + h + 54, 226, 24, { fontSize: 15, color: C.ink });
    });
  }

  const FIGURES = {
    // WEF Future of Jobs Report 2025, Figure 3.3, core skills in 2025, ranked.
    wefSkills(slide) {
      shape(slide, 700, 0, 580, 720, C.deep);
      text(slide, "CORE SKILLS EMPLOYERS NEED IN 2025", 748, 74, 470, 24, { fontSize: 13, bold: true, color: C.cream });
      text(slide, "Ranked by share of employers calling the skill essential", 748, 102, 470, 24, { fontSize: 12, color: C.ivory });
      shape(slide, 748, 138, 484, 400, C.white, "roundRect");
      rankLadder(slide, 772, 156, 440, [
        [1, "Analytical thinking"],
        [2, "Resilience, flexibility, agility"],
        [3, "Leadership and social influence"],
        [4, "Creative thinking"],
        [5, "Motivation and self-awareness"],
        [6, "Technological literacy"],
        [7, "Empathy and active listening"],
        [8, "Curiosity and lifelong learning"],
        [9, "Talent management"],
        [10, "Service orientation"],
      ], 4);
      text(slide, "Seven in 10 companies call analytical thinking essential.\nCreative thinking ranks fourth.", 748, 556, 470, 60, { fontSize: 14, color: C.ivory });
      text(slide, "World Economic Forum, Future of Jobs Report 2025.\nSurvey of over 1,000 employers across 55 economies.", 748, 626, 470, 50, { fontSize: 11, color: C.blue });
    },
  };

  function cover({ title, sub, meeting, figure, byline = "Designed by Jada Lin and Olivia Zheng\nGreat Neck South", notes: teaching, sources }) {
    const slide = newSlide(C.white);
    if (figure && FIGURES[figure]) {
      FIGURES[figure](slide);
    } else {
      shape(slide, 700, 0, 580, 720, C.deep);
      shape(slide, 760, 140, 460, 440, C.navy, "roundRect");
      text(slide, meeting.toUpperCase(), 800, 186, 380, 28, { fontSize: 14, bold: true, color: C.cream });
      shape(slide, 800, 226, 60, 6, C.cream, "roundRect");
      text(slide, title, 800, 262, 384, 280, { fontSize: 38, bold: true, color: C.white });
    }
    text(slide, "CAREER CANVAS", 72, 58, 300, 26, { fontSize: 15, bold: true, color: C.blue });
    shape(slide, 72, 96, 72, 8, C.navy, "roundRect");
    text(slide, title, 72, 152, 520, 190, { fontSize: title.length > 26 ? 44 : 52, bold: true, color: C.navy });
    text(slide, sub, 72, 364, 500, 120, { fontSize: 21, color: C.muted });
    text(slide, meeting, 72, 566, 220, 30, { fontSize: 17, bold: true, color: C.navy });
    text(slide, byline, 72, 606, 380, 50, { fontSize: 13, color: C.muted });
    notes(slide, teaching, sources);
  }

  // A real figure on its own slide, with the result stated above it.
  function barFigure({ kicker, title, sub, groups, series, takeaway, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    groupedBars(slide, 110, 240, 700, 250, groups, series);
    shape(slide, 880, 230, 300, 330, C.cream, "roundRect");
    text(slide, "WHAT IT MEANS", 910, 262, 250, 24, { fontSize: 13, bold: true, color: C.navy });
    text(slide, takeaway, 910, 300, 244, 230, { fontSize: 19, bold: true, color: C.navy });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Dark slide built around one number or one short claim.
  function statement({ kicker, title, stat, statText, footline, source, notes: teaching, sources }) {
    const slide = newSlide(C.deep);
    text(slide, kicker.toUpperCase(), 72, 50, 380, 26, { fontSize: 15, bold: true, color: C.yellow });
    text(slide, title, 72, 100, 820, 112, { fontSize: title.length > 40 ? 40 : 46, bold: true, color: C.white });
    text(slide, stat, 78, 248, 300, 180, { fontSize: stat.length > 4 ? 78 : 116, bold: true, color: C.yellow });
    text(slide, statText, 400, 268, 700, 150, { fontSize: 27, bold: true, color: C.white });
    shape(slide, 72, 488, 1035, 2, C.blue);
    text(slide, footline, 72, 522, 1040, 78, { fontSize: 24, color: C.sky });
    footer(slide, source, true);
    notes(slide, teaching, sources);
  }

  // Five (or fewer) labelled cards orbiting a centre idea.
  function nodeMap({ kicker, title, sub, centre, nodes, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    shape(slide, 507, 255, 266, 166, C.yellow, "ellipse");
    text(slide, centre, 527, 310, 226, 44, { fontSize: centre.length > 11 ? 22 : 27, bold: true, color: C.navy, alignment: "center" });
    const spots = [[88, 230], [82, 455], [432, 496], [845, 455], [875, 230]];
    nodes.forEach(([name, blurb, color], i) => {
      const [x, y] = spots[i];
      shape(slide, x, y, 320, 102, C.white, "roundRect", color, 3);
      text(slide, name, x + 18, y + 16, 284, 24, { fontSize: 15, bold: true, color });
      text(slide, blurb, x + 18, y + 46, 284, 46, { fontSize: 17, color: C.ink });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Teaching slide: definition, three moves, and a boxed activity.
  function feature({ label, title, bigWord, intro, items, activity, activityNote = "Constraint first. Then ideas.", source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    shape(slide, 0, 0, 34, 720, C.navy);
    text(slide, label.toUpperCase(), 72, 44, 560, 28, { fontSize: 15, bold: true, color: C.blue });
    const size = title.length > 55 ? 29 : title.length > 43 ? 33 : 38;
    text(slide, title, 72, 78, 1120, 74, { fontSize: size, bold: true, color: C.navy });
    text(slide, intro, 72, 150, 1110, 46, { fontSize: 19, color: C.muted });
    text(slide, bigWord, 75, 232, 640, 70, { fontSize: bigWord.length > 11 ? 44 : 58, bold: true, color: C.pale });
    items.forEach((item, i) => {
      shape(slide, 96, 326 + i * 70, 10, 10, i === 1 ? C.yellow : C.blue, "ellipse");
      text(slide, item, 124, 320 + i * 70, 582, 56, { fontSize: 21, color: C.ink });
    });
    shape(slide, 780, 210, 398, 362, C.navy, "roundRect");
    text(slide, "TRY IT", 820, 250, 300, 30, { fontSize: 15, bold: true, color: C.yellow });
    text(slide, activity, 840, 292, 288, 225, { fontSize: 22, bold: true, color: C.white, verticalAlignment: "middle" });
    text(slide, activityNote, 820, 520, 310, 26, { fontSize: 14, color: C.sky });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // A timed round. The task is the slide; the grounding is one line. The card on
  // the right names the piece of a real deliverable the student walks out with.
  function round({ label, minutes, task, steps, grounding, produces, producesNote, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    shape(slide, 0, 0, 34, 720, C.navy);
    text(slide, label.toUpperCase(), 72, 44, 470, 28, { fontSize: 15, bold: true, color: C.blue });
    // Timer badge, top right of the working column.
    shape(slide, 560, 38, 146, 44, C.yellow, "roundRect");
    text(slide, `${minutes} MIN`, 560, 50, 146, 26, { fontSize: 17, bold: true, color: C.navy, alignment: "center" });
    const size = task.length > 55 ? 30 : task.length > 42 ? 34 : 38;
    text(slide, task, 72, 92, 634, 106, { fontSize: size, bold: true, color: C.navy });
    steps.forEach((step, i) => {
      const y = 216 + i * 84;
      shape(slide, 72, y, 38, 38, C.pale, "roundRect");
      text(slide, String(i + 1), 72, y + 7, 38, 26, { fontSize: 18, bold: true, color: C.blue, alignment: "center" });
      text(slide, step, 126, y - 2, 580, 76, { fontSize: 21, color: C.ink });
    });
    shape(slide, 72, 596, 634, 52, C.pale, "roundRect");
    text(slide, grounding, 94, 610, 594, 30, { fontSize: 15, color: C.navy });
    shape(slide, 780, 120, 398, 452, C.navy, "roundRect");
    text(slide, "YOU WALK OUT WITH", 820, 158, 320, 30, { fontSize: 14, bold: true, color: C.yellow });
    text(slide, produces, 820, 206, 318, 250, { fontSize: 25, bold: true, color: C.white, verticalAlignment: "middle" });
    text(slide, producesNote, 820, 476, 318, 66, { fontSize: 15, color: C.sky });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Pill + sentence rows. Good for "same problem, five lenses" style slides.
  function rows({ kicker, title, sub, rows: items, source, notes: teaching, sources, bg = C.pale }) {
    const slide = newSlide(bg);
    header(slide, kicker, title, sub);
    const top = items.length > 4 ? 220 : 244;
    const gap = items.length > 4 ? 78 : 92;
    items.forEach(([pill, body, color], i) => {
      const y = top + i * gap;
      shape(slide, 72, y, 215, 58, color, "roundRect");
      text(slide, pill, 84, y + 18, 191, 25, { fontSize: 14, bold: true, color: C.white, alignment: "center" });
      text(slide, body, 318, y + 10, 842, 46, { fontSize: 21, color: C.ink });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Four numbered circles on a rail: a repeatable method.
  function pipeline({ kicker, title, sub, stages, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    shape(slide, 155, 352, 970, 5, C.line, "roundRect");
    stages.forEach(([num, name, desc, color], i) => {
      const x = 105 + i * 290;
      shape(slide, x, 290, 125, 125, color, "ellipse");
      text(slide, num, x + 33, 314, 60, 64, { fontSize: 44, bold: true, color: C.white, alignment: "center" });
      text(slide, name, x - 18, 440, 160, 30, { fontSize: 18, bold: true, color, alignment: "center" });
      text(slide, desc, x - 52, 482, 230, 78, { fontSize: 17, color: C.muted, alignment: "center" });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Two columns judged against each other: strong vs weak, ad A vs ad B.
  function compare({ kicker, title, sub, left, right, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    [[left, 72, C.blue], [right, 665, C.coral]].forEach(([col, x, color]) => {
      shape(slide, x, 212, 515, 400, C.white, "roundRect", color, 3);
      shape(slide, x, 212, 515, 56, color, "roundRect");
      text(slide, col.heading.toUpperCase(), x + 26, 228, 470, 28, { fontSize: 16, bold: true, color: C.white });
      col.points.forEach((p, i) => {
        shape(slide, x + 28, 306 + i * 74, 9, 9, color, "ellipse");
        text(slide, p, x + 54, 298 + i * 74, 434, 62, { fontSize: 19, color: C.ink });
      });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Numbered dark slide with a deliverable card: the in-meeting build task.
  function challenge({ kicker, title, minutes, steps, deliverable, source, notes: teaching, sources }) {
    const slide = newSlide(C.navy);
    text(slide, kicker.toUpperCase(), 72, 50, 340, 26, { fontSize: 15, bold: true, color: C.yellow });
    text(slide, title, 72, 96, 860, 72, { fontSize: title.length > 40 ? 36 : 42, bold: true, color: C.white });
    if (minutes) {
      shape(slide, 970, 96, 146, 44, C.yellow, "roundRect");
      text(slide, `${minutes} MIN`, 970, 108, 146, 26, { fontSize: 17, bold: true, color: C.navy, alignment: "center" });
    }
    steps.forEach(([num, body], i) => {
      const y = 210 + i * 91;
      text(slide, num, 84, y, 72, 38, { fontSize: 26, bold: true, color: C.yellow });
      text(slide, body, 170, y - 2, 760, 60, { fontSize: 22, color: C.white });
    });
    shape(slide, 970, 203, 230, 360, C.yellow, "roundRect");
    text(slide, "DELIVERABLE", 995, 235, 180, 25, { fontSize: 14, bold: true, color: C.navy, alignment: "center" });
    text(slide, deliverable.big, 995, 296, 180, 152, { fontSize: 30, bold: true, color: C.navy, alignment: "center", verticalAlignment: "middle" });
    text(slide, deliverable.note, 995, 468, 180, 66, { fontSize: 15, color: C.navy, alignment: "center" });
    footer(slide, source, true);
    notes(slide, teaching, sources);
  }

  // A checklist card: the structure students must actually produce.
  function checklist({ kicker, title, sub, items, aside, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    const col = (list, x) => list.forEach((item, i) => {
      const y = 222 + i * 78;
      shape(slide, x, y, 36, 36, C.pale, "roundRect");
      text(slide, "✓", x + 10, y + 4, 24, 28, { fontSize: 18, bold: true, color: C.blue });
      text(slide, item, x + 52, y - 2, aside ? 430 : 430, 66, { fontSize: 19, color: C.ink });
    });
    const half = Math.ceil(items.length / 2);
    col(items.slice(0, half), 72);
    col(items.slice(half), 600);
    if (aside) {
      shape(slide, 72, 600, 1136, 60, C.pale, "roundRect");
      text(slide, aside, 96, 616, 1090, 34, { fontSize: 18, color: C.navy });
    }
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Exit ticket on the left, next meeting on the right.
  function closer({ kicker, title, exit, next, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title);
    shape(slide, 72, 210, 520, 350, C.pale, "roundRect");
    text(slide, "EXIT TICKET", 110, 250, 260, 25, { fontSize: 15, bold: true, color: C.blue });
    exit.forEach((q, i) => text(slide, q, 110, 300 + i * 78, 420, 60, { fontSize: 24, bold: true, color: C.navy }));
    shape(slide, 665, 210, 515, 350, C.yellow, "roundRect");
    text(slide, "NEXT MEETING", 704, 250, 260, 25, { fontSize: 15, bold: true, color: C.navy });
    text(slide, next.title, 704, 300, 420, 58, { fontSize: next.title.length > 22 ? 27 : 32, bold: true, color: C.navy });
    text(slide, next.body, 704, 386, 410, 110, { fontSize: 22, color: C.navy });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // The source library slide. Two columns of org / title / url.
  function sourceLibrary({ entries, accessed, notes: teaching }) {
    const slide = newSlide(C.pale);
    header(slide, "Source library", "Research used in this meeting", `All links were accessed ${accessed}.`);
    const half = Math.ceil(entries.length / 2);
    const col = (list, x) => list.forEach(([org, title, url], i) => {
      const y = 220 + i * 102;
      text(slide, org, x, y, 470, 24, { fontSize: 16, bold: true, color: C.blue });
      text(slide, title, x, y + 27, 470, 30, { fontSize: 17, bold: true, color: C.navy });
      text(slide, url, x, y + 60, 470, 32, { fontSize: 12, color: C.muted });
    });
    col(entries.slice(0, half), 72);
    col(entries.slice(half), 665);
    footer(slide, "Full URLs are also stored in the speaker notes of the slides that use them");
    notes(slide, teaching ?? "Show only if students or reviewers want the research base.", entries.map((e) => e[3] ?? e[2]));
  }

  return {
    pres,
    layouts: { cover, barFigure, statement, nodeMap, feature, round, rows, pipeline, compare, challenge, checklist, closer, sourceLibrary },
    get count() { return n; },
  };
}

export async function finalize({ pres, slideCount, fileName }) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.rm(BUILD_DIR, { recursive: true, force: true });
  await fs.mkdir(BUILD_DIR, { recursive: true });
  const candidatePath = path.join(BUILD_DIR, `${fileName}.candidate.pptx`);
  await (await PresentationFile.exportPptx(pres)).save(candidatePath);
  const finalPath = path.join(OUTPUT_DIR, `${fileName}.pptx`);
  // The finalizer refuses to overwrite, so clear our own previous build first.
  await fs.rm(finalPath, { force: true });
  const result = await finalizePresentation({
    explicitTotalSlideCount: slideCount,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
    workspaceDir: WORKSPACE_DIR,
    candidatePath,
    finalPath,
    pythonExecutable: RUNTIME_PYTHON,
    integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
    fontPolicy: { basis: "design", families: [FONT] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(BUILD_DIR, `${fileName}.validation.json`),
  });
  return { finalPath, result };
}
