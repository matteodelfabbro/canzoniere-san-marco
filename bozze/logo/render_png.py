"""Disegna il logo "Notte" in PNG con Pillow, con le stesse misure di logo-c-notte.svg."""
import math, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, GOLD, CREAM = '#16233D', '#E6BD62', '#F7EBD3'
SS = 4096                      # disegno grande, poi riduzione: bordi morbidi
K = SS / 512

def T(x, y):                   # translate(256 256) scale(.88) translate(-256 -258)
    return ((x - 256) * .88 + 256) * K, ((y - 258) * .88 + 256) * K
R = lambda r: r * .88 * K

def bezier(p0, p1, p2, p3, n=80):
    return [tuple((1-t)**3*a + 3*(1-t)**2*t*b + 3*(1-t)*t*t*c + t**3*d for a, b, c, d in zip(p0, p1, p2, p3))
            for t in (i / n for i in range(n + 1))]

def rounded_bar(d, x0, y0, x1, y1, r, fill, round_bottom=True):
    (ax, ay), (bx, by) = T(x0, y0), T(x1, y1)
    rr = R(r)
    d.rounded_rectangle([ax, ay, bx, by], radius=rr, fill=fill)
    if not round_bottom:
        d.rectangle([ax, by - rr, bx, by], fill=fill)

def render():
    img = Image.new('RGB', (SS, SS), NAVY)
    d = ImageDraw.Draw(img)
    rounded_bar(d, 240, 60, 272, 374, 16, GOLD, round_bottom=False)   # braccio verticale = gambo
    rounded_bar(d, 158, 134, 354, 166, 16, GOLD)                      # braccio orizzontale
    # bandierina: M272 198 c30 36 116 66 107 134 -2 17 -9 31 -21 42 4-34 -14-70 -86-116 z
    x, y = 272, 198
    pts = bezier((x, y), (x+30, y+36), (x+116, y+66), (x+107, y+134))
    x2, y2 = x+107, y+134
    pts += bezier((x2, y2), (x2-2, y2+17), (x2-9, y2+31), (x2-21, y2+42))
    x3, y3 = x2-21, y2+42
    pts += bezier((x3, y3), (x3+4, y3-34), (x3-14, y3-70), (x3-86, y3-116))
    poly = [T(*p) for p in pts]
    d.polygon(poly, fill=CREAM)
    rr = R(3)                                                         # contorno arrotondato da 6
    for px, py in poly:
        d.ellipse([px-rr, py-rr, px+rr, py+rr], fill=CREAM)
    # testa della nota: ellisse 68x56 ruotata di -20° attorno a (208, 396)
    a = math.radians(-20)
    head = [(208 + 68*math.cos(t)*math.cos(a) - 56*math.sin(t)*math.sin(a),
             396 + 68*math.cos(t)*math.sin(a) + 56*math.sin(t)*math.cos(a))
            for t in (2*math.pi*i/720 for i in range(720))]
    d.polygon([T(*p) for p in head], fill=CREAM)
    return img

if __name__ == '__main__':
    big = render()
    os.makedirs(os.path.join(HERE, 'png'), exist_ok=True)
    for size in (1024, 512, 192, 180):
        big.resize((size, size), Image.LANCZOS).save(os.path.join(HERE, 'png', f'notte-{size}.png'), optimize=True)
    print('ok')
