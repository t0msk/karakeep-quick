#!/usr/bin/env python3
"""Generate the extension's toolbar icons at 16/32/48/128px.

Renders a gradient amber rounded-square badge with a dark bookmark
ribbon glyph, supersampled and downscaled for clean anti-aliasing.
Requires Pillow (`pip install pillow`).
"""

import os

from PIL import Image, ImageDraw

# Matches the app's --accent gradient / dark surface color tokens.
BG_STOPS = [
    (0.0, (0xFB, 0xBF, 0x4A)),
    (0.55, (0xF5, 0x9E, 0x0B)),
    (1.0, (0xC2, 0x66, 0x0A)),
]
RIBBON_TOP = (0x23, 0x21, 0x27)
RIBBON_BOTTOM = (0x0C, 0x0C, 0x0E)

SUPERSAMPLE = 8
CANVAS = 128


def lerp(a: tuple, b: tuple, t: float) -> tuple:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient_color(t: float, stops: list) -> tuple:
    t = max(0.0, min(1.0, t))
    for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
        if t0 <= t <= t1:
            local = (t - t0) / (t1 - t0) if t1 > t0 else 0
            return lerp(c0, c1, local)
    return stops[-1][1]


def make_background(size: int) -> Image.Image:
    img = Image.new('RGB', (size, size))
    px = img.load()
    # Diagonal gradient direction matching the source design (12,8)->(118,124).
    dx, dy = 106, 116
    length_sq = dx * dx + dy * dy
    for y in range(size):
        for x in range(size):
            rel_x = x / size * 128 - 12
            rel_y = y / size * 128 - 8
            t = (rel_x * dx + rel_y * dy) / length_sq
            px[x, y] = gradient_color(t, BG_STOPS)
    return img


def make_icon(size: int) -> Image.Image:
    hi = size * SUPERSAMPLE
    scale = hi / 128

    bg = make_background(hi)
    mask = Image.new('L', (hi, hi), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [6 * scale, 6 * scale, 122 * scale, 122 * scale],
        radius=27 * scale,
        fill=255,
    )

    canvas = Image.new('RGBA', (hi, hi), (0, 0, 0, 0))
    canvas.paste(bg, (0, 0), mask)

    # Soft top-left sheen for a bit of depth.
    sheen = Image.new('L', (hi, hi), 0)
    sheen_draw = ImageDraw.Draw(sheen)
    sheen_draw.ellipse(
        [-20 * scale, -40 * scale, 90 * scale, 70 * scale], fill=70
    )
    sheen_rgba = Image.new('RGBA', (hi, hi), (255, 255, 255, 0))
    sheen_rgba.putalpha(Image.composite(sheen, Image.new('L', (hi, hi), 0), mask))
    canvas = Image.alpha_composite(canvas, sheen_rgba)

    # Bookmark ribbon glyph: rounded top corners, flat sides, V-notch bottom.
    ribbon = Image.new('RGBA', (hi, hi), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ribbon)
    rd.rounded_rectangle(
        [45 * scale, 24.5 * scale, 83 * scale, 97.5 * scale],
        radius=6.5 * scale,
        corners=(True, True, False, False),
        fill=RIBBON_TOP + (255,),
    )
    # Carve the V-notch out of the bottom via an alpha mask.
    notch_cut = Image.new('L', (hi, hi), 255)
    nd = ImageDraw.Draw(notch_cut)
    nd.polygon(
        [
            (45 * scale, 97.5 * scale),
            (64 * scale, 83.5 * scale),
            (83 * scale, 97.5 * scale),
            (83 * scale, 130 * scale),
            (45 * scale, 130 * scale),
        ],
        fill=0,
    )
    _, _, _, a = ribbon.split()
    a = Image.composite(a, Image.new('L', (hi, hi), 0), notch_cut)

    ribbon_fill = Image.new('RGB', (hi, hi))
    fill_px = ribbon_fill.load()
    top_y, bottom_y = 24.5 * scale, 97.5 * scale
    for y in range(hi):
        t = (y - top_y) / (bottom_y - top_y)
        color = lerp(RIBBON_TOP, RIBBON_BOTTOM, t)
        for x in range(hi):
            fill_px[x, y] = color
    r, g, b = ribbon_fill.split()
    ribbon = Image.merge('RGBA', (r, g, b, a))

    # Thin highlight sliver near the top of the ribbon.
    rd2 = ImageDraw.Draw(ribbon)
    rd2.rectangle(
        [45 * scale, 24.5 * scale, 83 * scale, 32 * scale],
        fill=(255, 255, 255, 20),
    )

    canvas = Image.alpha_composite(canvas, ribbon)
    return canvas.resize((size, size), Image.LANCZOS)


out_dir = os.path.join(os.path.dirname(__file__), 'public', 'icons')
os.makedirs(out_dir, exist_ok=True)

for icon_size in [16, 32, 48, 128]:
    out_path = os.path.join(out_dir, f'icon{icon_size}.png')
    make_icon(icon_size).save(out_path)
    print(f'Generated {out_path}')
