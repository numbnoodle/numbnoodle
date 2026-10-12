# python3 scripts/tiles.py shots/home-desktop-light.png [tileHeight] [scale]
import sys
from PIL import Image
src = sys.argv[1]
th = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
scale = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
im = Image.open(src)
w, h = im.size
n = 0
for y in range(0, h, th):
    tile = im.crop((0, y, w, min(h, y + th)))
    tile = tile.resize((int(tile.width * scale), int(tile.height * scale)))
    out = src.replace('.png', f'-t{n}.png')
    tile.save(out)
    print(out)
    n += 1
