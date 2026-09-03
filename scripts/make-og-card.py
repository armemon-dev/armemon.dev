#!/usr/bin/env python3
"""
Regenerates public/og-card.png, the 1200x630 image link previews show
(WhatsApp, Slack, LinkedIn, X, iMessage, Discord).

Run manually after changing the copy or the portrait:

    python3 scripts/make-og-card.py

Deliberately not wired into `npm run build`: it needs Pillow and system fonts,
neither of which exist in Cloudflare's build container. The PNG is committed.

Card copy lives in CARD below and should agree with the About section and
src/data/site.js. Nothing here reaches for an em dash.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTO = ROOT / "public" / "armemon.webp"
OUT = ROOT / "public" / "og-card.png"

W, H = 1200, 630
SS = 2  # supersample factor, downsampled at the end for clean curves and text

# Site palette, from src/styles.css
NAVY = (15, 23, 42)
WHITE = (226, 232, 240)
SLATE = (148, 163, 184)
SLATE_LIGHT = (203, 213, 225)
ACCENT = (94, 234, 212)
SKY = (56, 189, 248)
INDIGO = (129, 140, 248)
DIM = (110, 124, 145)

CARD = {
    "eyebrow": "PRODUCT DEVELOPER",
    "name": "Ahmed Raza Memon",
    # "|" forces a deliberate line break rather than letting it wrap awkwardly
    "line": "Web and mobile software,|built and shipped end to end.",
    # Inline segments: (text, weight, colour). Status sits beside each domain in
    # a lighter weight and colour instead of inside brackets, so the domains read
    # first and "live" is the word that catches the eye.
    "projects": [
        ("Projects  ", "regular", DIM),
        ("withinbench.com", "bold", SLATE_LIGHT),
        ("  live", "regular", ACCENT),
        ("   ", "regular", DIM),
        ("titlania.com", "bold", SLATE_LIGHT),
        ("  live", "regular", ACCENT),
        ("   and more", "regular", DIM),
    ],
    "stack": ["React", "React Native", "Next.js", "TypeScript", "Firebase", "Cloudflare"],
    "domain": "ARMEMON.DEV",
}

FONT_DIR = "/usr/share/fonts/truetype/liberation"
BOLD = f"{FONT_DIR}/LiberationSans-Bold.ttf"
REGULAR = f"{FONT_DIR}/LiberationSans-Regular.ttf"


def font(path, size):
    return ImageFont.truetype(path, size * SS)


def measure(draw, text, fnt, tracking=0):
    width = draw.textlength(text, font=fnt)
    return width + tracking * SS * max(len(text) - 1, 0)


def text_tracked(draw, xy, text, fnt, fill, tracking=0):
    """PIL has no letter-spacing, so step through the string manually."""
    x, y = xy
    if not tracking:
        draw.text((x, y), text, font=fnt, fill=fill)
        return
    for char in text:
        draw.text((x, y), char, font=fnt, fill=fill)
        x += draw.textlength(char, font=fnt) + tracking * SS


def wrap(draw, text, fnt, max_width):
    words, lines, current = text.split(), [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def radial_glow(size, center, radius, color, peak_alpha):
    """
    Built small and scaled up: a per-pixel loop at full resolution would be
    millions of iterations, and the upscale blurs it into a smooth falloff.
    """
    sw, sh = 120, int(120 * size[1] / size[0])
    small = Image.new("L", (sw, sh), 0)
    px = small.load()
    cx, cy = center[0] / size[0] * sw, center[1] / size[1] * sh
    r = radius / size[0] * sw
    for y in range(sh):
        for x in range(sw):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if d < r:
                falloff = (1 - d / r) ** 2
                px[x, y] = int(peak_alpha * falloff)
    mask = small.resize(size, Image.LANCZOS)
    layer = Image.new("RGB", size, color)
    return layer, mask


def circular_portrait(diameter, ring):
    """
    Circular crop matching the site's `object-position: 50% 15%`, wrapped in the
    same teal to sky to indigo ring the sidebar photo uses.
    """
    src = Image.open(PHOTO).convert("RGB")
    side = min(src.width, src.height)
    overflow = src.height - side
    top = int(overflow * 0.15)
    src = src.crop((0, top, side, top + side)).resize((diameter, diameter), Image.LANCZOS)

    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, diameter - 1, diameter - 1), fill=255)

    total = diameter + ring * 2
    canvas = Image.new("RGBA", (total, total), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    stops = [ACCENT, SKY, INDIGO, ACCENT]
    for deg in range(360):
        t = deg / 360 * (len(stops) - 1)
        i = min(int(t), len(stops) - 2)
        f = t - i
        a, b = stops[i], stops[i + 1]
        colour = tuple(int(a[c] + (b[c] - a[c]) * f) for c in range(3))
        start = deg + 140  # matches conic-gradient(from 140deg, ...)
        draw.arc((0, 0, total - 1, total - 1), start, start + 2, fill=colour, width=ring)

    canvas.paste(src, (ring, ring), mask)
    return canvas


def build():
    size = (W * SS, H * SS)
    img = Image.new("RGB", size, NAVY)

    # Ambient glow, echoing the halo behind the site
    for center, radius, colour, alpha in [
        ((W * 0.52, -H * 0.10), W * 0.62, (94, 234, 212), 46),
        ((W * 0.86, H * 0.44), W * 0.42, (56, 189, 248), 28),
    ]:
        layer, mask = radial_glow(size, (center[0] * SS, center[1] * SS), radius * SS, colour, alpha)
        img = Image.composite(Image.blend(img, layer, 0.55), img, mask)

    draw = ImageDraw.Draw(img)

    # Faint vertical rules for texture
    for x in range(0, W, 60):
        draw.line([(x * SS, 0), (x * SS, size[1])], fill=(21, 31, 54), width=1)

    f_eyebrow = font(BOLD, 17)
    f_name = font(BOLD, 71)
    f_line = font(BOLD, 29)
    f_detail = font(REGULAR, 20)
    f_detail_bold = font(BOLD, 20)
    f_domain = font(BOLD, 17)

    margin = 80 * SS
    column = 700 * SS

    # Eyebrow: short rule then tracked label, the same motif as the sidebar nav
    rule_y = 96 * SS
    draw.line([(margin, rule_y), (margin + 46 * SS, rule_y)], fill=ACCENT, width=2 * SS)
    text_tracked(draw, (margin + 64 * SS, rule_y - 11 * SS), CARD["eyebrow"], f_eyebrow, ACCENT, tracking=3.4)

    y = 132 * SS
    draw.text((margin, y), CARD["name"], font=f_name, fill=WHITE)
    y += 96 * SS

    for chunk in CARD["line"].split("|"):
        for line in wrap(draw, chunk, f_line, column):
            draw.text((margin, y), line, font=f_line, fill=SLATE_LIGHT)
            y += 42 * SS

    y += 14 * SS
    x = margin
    for text, weight, colour in CARD["projects"]:
        fnt = f_detail_bold if weight == "bold" else f_detail
        draw.text((x, y), text, font=fnt, fill=colour)
        x += draw.textlength(text, font=fnt)
    if x > margin + column:
        print(f"  warning: projects line is {(x - margin) / SS:.0f}px, column is {column / SS:.0f}px")
    y += 30 * SS

    # Stack pills, matching .tag-list on the site: teal on a faint teal wash
    pill_bg = tuple(int(NAVY[c] + (ACCENT[c] - NAVY[c]) * 0.13) for c in range(3))
    f_pill = font(BOLD, 17)
    # The pill row may run wider than the text column: it only has to clear the
    # portrait, not wrap with the copy.
    pill_row_width = 790 * SS
    pill_h, pill_gap = 42 * SS, 9 * SS
    widths = [draw.textlength(label, font=f_pill) + 32 * SS for label in CARD["stack"]]

    rows, row, row_w = [], [], 0
    for label, pill_w in zip(CARD["stack"], widths):
        if row and row_w + pill_w > pill_row_width:
            rows.append(row)
            row, row_w = [], 0
        row.append((label, pill_w))
        row_w += pill_w + pill_gap
    if row:
        rows.append(row)

    pill_y = size[1] - 128 * SS - (len(rows) - 1) * (pill_h + pill_gap)
    for row in rows:
        px_cursor = margin
        for label, pill_w in row:
            draw.rounded_rectangle(
                (px_cursor, pill_y, px_cursor + pill_w, pill_y + pill_h),
                radius=pill_h // 2, fill=pill_bg,
            )
            draw.text((px_cursor + 16 * SS, pill_y + 11 * SS), label, font=f_pill, fill=ACCENT)
            px_cursor += pill_w + pill_gap
        pill_y += pill_h + pill_gap

    # Portrait, right side, vertically centred
    diameter, ring = 268 * SS, 5 * SS
    portrait = circular_portrait(diameter, ring)
    px = size[0] - margin - portrait.width
    py = (size[1] - portrait.height) // 2
    img.paste(portrait, (px, py), portrait)

    # Domain, bottom right, aligned to the portrait's right edge
    domain_w = measure(draw, CARD["domain"], f_domain, tracking=3.2)
    text_tracked(
        draw,
        (size[0] - margin - domain_w, size[1] - 74 * SS),
        CARD["domain"], f_domain, SLATE, tracking=3.2,
    )

    img.resize((W, H), Image.LANCZOS).save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)}  {OUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    build()
