#!/usr/bin/env python3
"""Checks the built decks against three rules that are easy to break by hand:

1. No embedded images. The decks are vector-only; the one AI illustration was removed.
2. No off-palette colors. Every solid fill and text color must be a brand color.
3. Nothing off-canvas. Every shape must sit inside the 1280x720 slide.

Run: python3 check_decks.py
"""
import glob
import re
import sys
import zipfile

PALETTE = {
    "0F1A2B",  # Deep Navy
    "1C2E4A",  # Midnight Blue
    "52677D",  # Dusty Blue
    "BDC4D4",  # Ivory
    "D1CFC9",  # Buttercream
    "FFFFFF",  # white
}

EMU_W, EMU_H = 12192000, 6858000
OUT = "/Users/jada/Documents/New project 2/career-development-deca/slides/output"

failures = []
checked = [0]  # shapes actually inspected, so a passing run cannot be vacuous

for path in sorted(glob.glob(f"{OUT}/Career_Canvas_Meeting_*.pptx")):
    name = path.rsplit("/", 1)[-1]
    if "_Creativity_Across_Business" in name:
        continue  # superseded Meeting 1 builds, kept locally only
    z = zipfile.ZipFile(path)

    media = [n for n in z.namelist() if n.startswith("ppt/media/")]
    if media:
        failures.append(f"{name}: embeds {len(media)} image(s): {media[:3]}")

    for entry in sorted(n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)):
        xml = z.read(entry).decode()
        slide = entry.rsplit("/", 1)[-1]

        for hexval in set(re.findall(r'val="([0-9A-Fa-f]{6})"', xml)):
            if hexval.upper() not in PALETTE:
                failures.append(f"{name} {slide}: off-palette color #{hexval}")

        # Offsets and extents live together inside an <a:xfrm>. Match the pair
        # there rather than zipping two global lists, and note the tags are
        # self-closing with a space, which an earlier version of this check
        # missed entirely and so passed without inspecting a single shape.
        boxes = re.findall(
            r'<a:off x="(-?\d+)" y="(-?\d+)"\s*/>\s*<a:ext cx="(\d+)" cy="(\d+)"\s*/>', xml)
        if not boxes:
            failures.append(f"{name} {slide}: no shape geometry found, the check would be vacuous")
        checked[0] += len(boxes)
        for x, y, cx, cy in boxes:
            x, y, right, bottom = int(x), int(y), int(x) + int(cx), int(y) + int(cy)
            if x < 0 or y < 0 or right > EMU_W + 1000 or bottom > EMU_H + 1000:
                failures.append(
                    f"{name} {slide}: shape outside the slide "
                    f"({x/12700:.0f},{y/12700:.0f} to {right/12700:.0f},{bottom/12700:.0f} pt)")

if failures:
    print(f"{len(failures)} problem(s):")
    for f in failures[:40]:
        print(f"  - {f}")
    sys.exit(1)

print(f"decks pass: {checked[0]} shapes inspected, no embedded images, "
      "all colors on-palette, nothing off-canvas")
