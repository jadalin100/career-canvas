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
    const titleColor = onDark ? C.white : C.navy;
    const bandFill = onDark ? C.blue : C.navy;
    text(slide, title, 54, 34, 1172, 58, { fontSize: title.length > 62 ? 29 : title.length > 46 ? 33 : 37, bold: true, color: titleColor, alignment: "center" });
    shape(slide, 54, 102, 1172, 42, bandFill);
    text(slide, kicker.toUpperCase(), 68, 111, 1144, 24, { fontSize: 15, bold: true, color: C.white });
    if (sub) text(slide, sub, 68, 156, 1144, 42, { fontSize: 18, color: onDark ? C.ivory : C.muted });
  }

  function footer(slide, sourceLabel = "", onDark = false) {
    if (sourceLabel) text(slide, sourceLabel, 54, 654, 1134, 20, { fontSize: 9, color: onDark ? C.ivory : C.muted });
    shape(slide, 0, 684, 1280, 36, onDark ? C.blue : C.navy);
    text(slide, "CAREER CANVAS", 28, 692, 250, 20, { fontSize: 12, bold: true, color: C.white });
    shape(slide, 278, 701, 900, 2, C.ivory);
    text(slide, String(n).padStart(2, "0"), 1195, 692, 56, 20, { fontSize: 12, bold: true, color: C.white, alignment: "right" });
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
    const slide = newSlide(C.deep);
    text(slide, "CAREER CANVAS", 58, 42, 470, 30, { fontSize: 20, bold: true, color: C.cream });
    text(slide, "CAREER DEVELOPMENT WORKSHOP", 58, 84, 700, 24, { fontSize: 13, bold: true, color: C.ivory });
    shape(slide, 58, 148, 1164, 374, C.cream);
    shape(slide, 58, 148, 15, 374, C.blue);
    text(slide, meeting.toUpperCase(), 100, 184, 620, 28, { fontSize: 18, bold: true, color: C.blue });
    text(slide, title, 100, 230, 1040, 156, { fontSize: title.length > 30 ? 58 : 66, bold: true, color: C.deep });
    shape(slide, 100, 408, 1070, 3, C.blue);
    text(slide, sub, 100, 432, 1030, 67, { fontSize: 22, color: C.deep });
    text(slide, byline, 58, 577, 490, 55, { fontSize: 18, color: C.white });
    text(slide, "GREAT NECK SOUTH", 814, 584, 408, 30, { fontSize: 19, bold: true, color: C.ivory, alignment: "right" });
    shape(slide, 0, 684, 1280, 36, C.blue);
    notes(slide, teaching, sources);
  }

  // A real figure on its own slide, with the result stated above it.
  function barFigure({ kicker, title, sub, groups, series, takeaway, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    shape(slide, 54, 212, 770, 42, C.blue);
    text(slide, "RECALL AFTER STUDYING", 70, 222, 734, 25, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 54, 262, 770, 352, C.cream, "rect", C.blue, 4);
    groupedBars(slide, 95, 292, 688, 215, groups, series);
    shape(slide, 844, 212, 382, 42, C.navy);
    text(slide, "WHAT IT MEANS", 860, 222, 350, 25, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 844, 262, 382, 352, C.white, "rect", C.blue, 4);
    text(slide, takeaway, 874, 300, 322, 277, { fontSize: 23, bold: true, color: C.navy, verticalAlignment: "middle" });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Dark slide built around one number or one short claim.
  function statement({ kicker, title, stat, statText, footline, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title);
    shape(slide, 54, 178, 1172, 42, C.blue);
    text(slide, "THE IDEA", 68, 187, 1120, 24, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 54, 230, 1172, 236, C.cream, "rect", C.blue, 4);
    text(slide, stat, 84, 260, 245, 150, { fontSize: stat.length > 3 ? 64 : stat.length > 2 ? 84 : 118, bold: true, color: C.navy, alignment: "center" });
    shape(slide, 348, 252, 3, 190, C.blue);
    text(slide, statText, 390, 270, 778, 148, { fontSize: 29, bold: true, color: C.deep, verticalAlignment: "middle" });
    shape(slide, 54, 482, 1172, 42, C.navy);
    text(slide, "WHY IT MATTERS TODAY", 68, 491, 1120, 24, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 54, 534, 1172, 100, C.white, "rect", C.blue, 4);
    text(slide, footline, 78, 554, 1122, 62, { fontSize: 23, color: C.deep });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Five (or fewer) labelled cards orbiting a centre idea.
  function nodeMap({ kicker, title, sub, centre, nodes, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    shape(slide, 54, 218, 1172, 62, C.navy);
    text(slide, centre.toUpperCase(), 80, 234, 1120, 32, { fontSize: 24, bold: true, color: C.white, alignment: "center" });
    const spots = [[54, 300], [455, 300], [856, 300], [255, 457], [656, 457]];
    nodes.forEach(([name, blurb, color], i) => {
      const [x, y] = spots[i];
      shape(slide, x, y, 370, 137, C.cream, "rect", C.blue, 3);
      shape(slide, x, y, 370, 39, C.blue);
      text(slide, name, x + 16, y + 8, 338, 27, { fontSize: 16, bold: true, color: C.white });
      text(slide, blurb, x + 18, y + 51, 334, 70, { fontSize: 18, color: C.ink });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Teaching slide: definition, three moves, and a boxed activity.
  function feature({ label, title, bigWord, intro, items, activity, activityNote = "Constraint first. Then ideas.", source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, label, title, intro);
    shape(slide, 54, 215, 690, 44, C.blue);
    text(slide, bigWord.toUpperCase(), 70, 225, 658, 27, { fontSize: 17, bold: true, color: C.white });
    shape(slide, 54, 266, 690, 330, C.cream, "rect", C.blue, 4);
    items.forEach((item, i) => {
      const y = 294 + i * 87;
      text(slide, String(i + 1).padStart(2, "0"), 76, y, 50, 35, { fontSize: 20, bold: true, color: C.blue });
      text(slide, item, 136, y - 2, 574, 65, { fontSize: 21, color: C.ink });
    });
    shape(slide, 770, 215, 456, 44, C.navy);
    text(slide, "TRY IT", 786, 225, 420, 27, { fontSize: 17, bold: true, color: C.white });
    shape(slide, 770, 266, 456, 330, C.white, "rect", C.blue, 4);
    text(slide, activity, 802, 298, 392, 220, { fontSize: 23, bold: true, color: C.navy, verticalAlignment: "middle" });
    text(slide, activityNote, 802, 542, 392, 39, { fontSize: 16, color: C.blue });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // A timed round. The task is the slide; the grounding is one line. The card on
  // the right names the piece of a real deliverable the student walks out with.
  function round({ label, minutes, task, steps, grounding, produces, producesNote, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, label, task);
    shape(slide, 1070, 104, 154, 40, C.cream);
    text(slide, `${minutes} MIN`, 1074, 113, 146, 23, { fontSize: 17, bold: true, color: C.deep, alignment: "center" });
    shape(slide, 54, 178, 690, 44, C.blue);
    text(slide, "YOUR TASK", 68, 188, 650, 25, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 54, 230, 690, 350, C.cream, "rect", C.blue, 4);
    steps.forEach((step, i) => {
      const y = 260 + i * 103;
      shape(slide, 78, y, 48, 48, C.navy);
      text(slide, String(i + 1), 80, y + 7, 44, 30, { fontSize: 22, bold: true, color: C.white, alignment: "center" });
      text(slide, step, 146, y - 2, 566, 78, { fontSize: 21, color: C.deep });
    });
    shape(slide, 770, 178, 456, 44, C.navy);
    text(slide, "YOU LEAVE WITH", 786, 188, 410, 25, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 770, 230, 456, 350, C.white, "rect", C.blue, 4);
    text(slide, produces, 802, 272, 388, 184, { fontSize: 30, bold: true, color: C.navy, verticalAlignment: "middle" });
    shape(slide, 802, 480, 385, 3, C.ivory);
    text(slide, producesNote, 802, 499, 385, 65, { fontSize: 17, color: C.blue });
    text(slide, grounding, 58, 599, 1166, 46, { fontSize: 16, color: C.muted });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Pill + sentence rows. Good for "same problem, five lenses" style slides.
  function rows({ kicker, title, sub, rows: items, source, notes: teaching, sources, bg = C.pale }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    const top = items.length > 4 ? 212 : 230;
    const gap = items.length > 4 ? 84 : 102;
    items.forEach(([pill, body, color], i) => {
      const y = top + i * gap;
      shape(slide, 54, y, 1172, 70, C.cream, "rect", C.blue, 3);
      shape(slide, 54, y, 234, 70, C.navy);
      text(slide, pill, 72, y + 18, 200, 40, { fontSize: 17, bold: true, color: C.white, alignment: "center" });
      text(slide, body, 318, y + 12, 882, 51, { fontSize: 21, color: C.ink });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Four numbered circles on a rail: a repeatable method.
  function pipeline({ kicker, title, sub, stages, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    shape(slide, 54, 220, 1172, 44, C.blue);
    text(slide, "MEETING PLAN", 68, 230, 1128, 25, { fontSize: 16, bold: true, color: C.white });
    stages.forEach(([num, name, desc, color], i) => {
      const x = 54 + i * 293;
      shape(slide, x, 278, 279, 324, i % 2 ? C.white : C.cream, "rect", C.blue, 3);
      shape(slide, x, 278, 279, 104, C.navy);
      text(slide, num, x + 24, 294, 231, 75, { fontSize: 56, bold: true, color: C.white, alignment: "center" });
      text(slide, name, x + 18, 402, 243, 50, { fontSize: 18, bold: true, color: C.navy, alignment: "center" });
      text(slide, desc, x + 20, 464, 239, 115, { fontSize: 18, color: C.deep, alignment: "center" });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Two columns judged against each other: strong vs weak, ad A vs ad B.
  function compare({ kicker, title, sub, left, right, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    [[left, 54, C.navy], [right, 650, C.blue]].forEach(([col, x, color]) => {
      shape(slide, x, 212, 576, 420, C.cream, "rect", C.blue, 4);
      shape(slide, x, 212, 576, 56, color);
      text(slide, col.heading.toUpperCase(), x + 26, 228, 520, 28, { fontSize: 17, bold: true, color: C.white });
      col.points.forEach((p, i) => {
        const y = 294 + i * (col.points.length > 4 ? 64 : 78);
        text(slide, String(i + 1).padStart(2, "0"), x + 28, y, 45, 34, { fontSize: 17, bold: true, color: C.blue });
        text(slide, p, x + 82, y - 3, 452, 61, { fontSize: 19, color: C.ink });
      });
    });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Numbered dark slide with a deliverable card: the in-meeting build task.
  function challenge({ kicker, title, minutes, steps, deliverable, source, notes: teaching, sources }) {
    const slide = newSlide(C.navy);
    header(slide, kicker, title, "", true);
    if (minutes) {
      shape(slide, 1070, 104, 154, 40, C.cream);
      text(slide, `${minutes} MIN`, 1074, 113, 146, 25, { fontSize: 17, bold: true, color: C.navy, alignment: "center" });
    }
    shape(slide, 54, 188, 860, 44, C.blue);
    text(slide, "BUILD STEPS", 68, 198, 820, 25, { fontSize: 16, bold: true, color: C.white });
    steps.forEach(([num, body], i) => {
      const y = 248 + i * (steps.length > 4 ? 73 : 87);
      shape(slide, 54, y, 860, 68, C.cream, "rect", C.blue, 2);
      text(slide, num, 74, y + 12, 72, 43, { fontSize: 28, bold: true, color: C.blue });
      text(slide, body, 160, y + 9, 734, 50, { fontSize: 21, color: C.deep });
    });
    shape(slide, 932, 188, 294, 44, C.cream);
    text(slide, "DELIVERABLE", 948, 198, 260, 25, { fontSize: 16, bold: true, color: C.navy });
    shape(slide, 932, 240, 294, 355, C.white, "rect", C.cream, 4);
    text(slide, deliverable.big, 958, 278, 242, 187, { fontSize: 31, bold: true, color: C.navy, alignment: "center", verticalAlignment: "middle" });
    shape(slide, 958, 482, 242, 3, C.ivory);
    text(slide, deliverable.note, 958, 503, 242, 72, { fontSize: 16, color: C.blue, alignment: "center" });
    footer(slide, source, true);
    notes(slide, teaching, sources);
  }

  // A checklist card: the structure students must actually produce.
  function checklist({ kicker, title, sub, items, aside, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title, sub);
    const col = (list, x) => list.forEach((item, i) => {
      const y = 234 + i * 80;
      shape(slide, x, y, 555, 76, C.cream, "rect", C.blue, 3);
      shape(slide, x, y, 58, 76, C.navy);
      text(slide, String(i + 1).padStart(2, "0"), x + 9, y + 22, 40, 30, { fontSize: 18, bold: true, color: C.white, alignment: "center" });
      text(slide, item, x + 76, y + 9, 462, 58, { fontSize: 19, color: C.ink });
    });
    const half = Math.ceil(items.length / 2);
    col(items.slice(0, half), 54);
    col(items.slice(half), 671);
    if (aside) {
      shape(slide, 54, 568, 1172, 65, C.blue);
      text(slide, aside, 76, 582, 1128, 43, { fontSize: 18, color: C.white });
    }
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // Exit ticket on the left, next meeting on the right.
  function closer({ kicker, title, exit, next, source, notes: teaching, sources }) {
    const slide = newSlide(C.white);
    header(slide, kicker, title);
    shape(slide, 54, 188, 572, 44, C.navy);
    text(slide, "EXIT TICKET", 70, 198, 540, 25, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 54, 240, 572, 366, C.cream, "rect", C.blue, 4);
    exit.forEach((q, i) => {
      const y = 270 + i * 101;
      text(slide, String(i + 1).padStart(2, "0"), 78, y, 54, 34, { fontSize: 21, bold: true, color: C.blue });
      text(slide, q, 148, y - 3, 450, 75, { fontSize: 23, bold: true, color: C.navy });
    });
    shape(slide, 650, 188, 576, 44, C.blue);
    text(slide, "NEXT MEETING", 666, 198, 544, 25, { fontSize: 16, bold: true, color: C.white });
    shape(slide, 650, 240, 576, 366, C.white, "rect", C.blue, 4);
    text(slide, next.title, 686, 298, 504, 76, { fontSize: next.title.length > 22 ? 29 : 35, bold: true, color: C.navy });
    shape(slide, 686, 395, 492, 3, C.ivory);
    text(slide, next.body, 686, 421, 496, 143, { fontSize: 23, color: C.deep });
    footer(slide, source);
    notes(slide, teaching, sources);
  }

  // The source library slide. Two columns of org / title / url.
  function sourceLibrary({ entries, accessed, notes: teaching }) {
    const slide = newSlide(C.white);
    header(slide, "Source library", "Research used in this meeting", `All links were accessed ${accessed}.`);
    const half = Math.ceil(entries.length / 2);
    const col = (list, x) => list.forEach(([org, title, url], i) => {
      const y = 216 + i * (half > 3 ? 105 : 130);
      shape(slide, x, y, 552, half > 3 ? 94 : 114, C.cream, "rect", C.blue, 2);
      shape(slide, x, y, 12, half > 3 ? 94 : 114, C.navy);
      text(slide, org, x + 28, y + 9, 510, 24, { fontSize: 16, bold: true, color: C.blue });
      text(slide, title, x + 28, y + 36, 510, 32, { fontSize: 17, bold: true, color: C.navy });
      text(slide, url, x + 28, y + 72, 510, 25, { fontSize: 12, color: C.muted });
    });
    col(entries.slice(0, half), 54);
    col(entries.slice(half), 674);
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
