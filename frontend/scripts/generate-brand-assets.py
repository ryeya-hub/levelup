"""Render the existing LevelUp SVG geometry with Pillow; no runtime dependency.

Run with a Python installation containing Pillow. The optional font argument is an
existing system semibold font, used only for the committed social sharing image.
"""
from pathlib import Path
import argparse
import math
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
SYMBOL = ROOT / 'src/assets/brand/levelup-symbol.svg'
INDIGO, LIME, SURFACE = '#6857F2', '#B9EE64', '#F7F8FB'
RECTS = ET.parse(SYMBOL).findall('.//{http://www.w3.org/2000/svg}rect')


def symbol(draw, x, y, size, fill=INDIGO):
    scale = size / 64
    for rect in RECTS:
        a = {k: float(v) for k, v in rect.attrib.items()}
        draw.rounded_rectangle((x + a['x'] * scale, y + a['y'] * scale,
                                x + (a['x'] + a['width']) * scale,
                                y + (a['y'] + a['height']) * scale),
                               radius=a['rx'] * scale, fill=fill)


def icon(size, maskable=False, transparent=False):
    # Supersampling preserves the small mark's rounded corners at favicon sizes.
    factor = 4
    image = Image.new('RGBA', (size * factor, size * factor),
                      (0, 0, 0, 0) if transparent else SURFACE)
    mark = size * (0.52 if maskable else 0.76) * factor
    offset = (size * factor - mark) / 2
    symbol(ImageDraw.Draw(image), offset, offset, mark)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def install_assets():
    PUBLIC.joinpath('favicon.svg').write_text(SYMBOL.read_text(), encoding='utf-8', newline='\n')
    for size in (180, 192, 512):
        icon(size).convert('RGB').save(PUBLIC / f'icon-{size}.png', optimize=True)
    mask = icon(512, maskable=True).convert('RGB')
    mask.save(PUBLIC / 'icon-maskable-512.png', optimize=True)
    icon(48, transparent=True).save(PUBLIC / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    # Every non-background pixel must fit the maskable icon's central 80% circle.
    bg = Image.new('RGB', (1, 1), SURFACE).getpixel((0, 0))
    for y in range(512):
        for x in range(512):
            if mask.getpixel((x, y)) != bg:
                assert math.hypot(x - 256, y - 256) < 512 * 0.4


def social_asset(font_path):
    image = Image.new('RGB', (1200, 630), SURFACE)
    draw = ImageDraw.Draw(image)
    # An original large ascending motif, echoing the compact mark without new art.
    for x, top in ((850, 356), (958, 248), (1066, 140)):
        draw.rounded_rectangle((x, top, x + 72, 540), radius=20, fill=INDIGO)
    draw.rounded_rectangle((1066, 112, 1138, 128), radius=8, fill=LIME)
    symbol(draw, 76, 126, 92)
    draw.text((190, 123), 'LevelUp', font=ImageFont.truetype(font_path, 76), fill='#111827')
    draw.text((82, 272), 'Train today.', font=ImageFont.truetype(font_path, 46), fill='#111827')
    draw.text((82, 332), 'Grow over time.', font=ImageFont.truetype(font_path, 46), fill='#111827')
    draw.rounded_rectangle((84, 440, 156, 450), radius=5, fill=LIME)
    image.save(PUBLIC / 'social-preview.png', optimize=True)


def verify_assets():
    for name, size in [('icon-180.png', (180, 180)), ('icon-192.png', (192, 192)),
                       ('icon-512.png', (512, 512)), ('icon-maskable-512.png', (512, 512)),
                       ('social-preview.png', (1200, 630))]:
        with Image.open(PUBLIC / name) as image:
            assert image.format == 'PNG' and image.size == size, name
            image.verify()
    with Image.open(PUBLIC / 'favicon.ico') as image:
        assert image.format == 'ICO' and image.ico.sizes() == {(16, 16), (32, 32), (48, 48)}
    assert PUBLIC.joinpath('favicon.svg').read_text() == SYMBOL.read_text()
    with Image.open(PUBLIC / 'icon-maskable-512.png') as image:
        bg = image.getpixel((0, 0))
        for y in range(512):
            for x in range(512):
                if image.getpixel((x, y)) != bg:
                    assert math.hypot(x - 256, y - 256) < 512 * 0.4
    print('7 brand images decoded and validated; maskable foreground is inside the safe circle.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--font', default='C:/Windows/Fonts/seguisb.ttf')
    parser.add_argument('--social', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        verify_assets()
    elif args.social:
        social_asset(args.font)
    else:
        install_assets()
