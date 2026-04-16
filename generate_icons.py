#!/usr/bin/env python3
"""Generate simple bookmark SVG icons at 16/32/48/128px."""

import struct, zlib, base64, os

def make_png(size: int) -> bytes:
    """Generate a minimal valid PNG bookmark icon."""
    s = size
    # Draw a bookmark shape: rectangle with V notch at bottom
    pixels = []
    pad = max(1, s // 10)
    mid = s // 2
    notch = s // 5

    for y in range(s):
        row = []
        for x in range(s):
            in_rect = pad <= x < s - pad and pad <= y < s - pad
            # V notch at bottom
            if in_rect and y >= s - pad - notch:
                depth = y - (s - pad - notch)
                left_slope = abs(x - mid) <= (notch - depth)
                in_rect = not left_slope

            if in_rect:
                # Amber fill: #f59e0b
                row += [0xf5, 0x9e, 0x0b, 0xff]
            else:
                row += [0x00, 0x00, 0x00, 0x00]
        pixels.append(bytes([0] + row))  # filter byte

    raw = b"".join(pixels)
    compressed = zlib.compress(raw, 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr_data = struct.pack(">IIBBBBB", s, s, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr_data)
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")
    return png

out_dir = os.path.join(os.path.dirname(__file__), "public", "icons")
os.makedirs(out_dir, exist_ok=True)

for size in [16, 32, 48, 128]:
    path = os.path.join(out_dir, f"icon{size}.png")
    with open(path, "wb") as f:
        f.write(make_png(size))
    print(f"Generated {path}")
