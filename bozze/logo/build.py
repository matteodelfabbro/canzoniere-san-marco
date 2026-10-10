"""Genera le proposte di logo (SVG) e la pagina di confronto."""
import base64, os
HERE = os.path.dirname(os.path.abspath(__file__))
GOLD, WINE, CREAM, NAVY = '#DFA22E', '#9E1B34', '#FBF1E1', '#16233D'

def svg(bg, inner, shift=0):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Canzoniere San Marco">
  <rect width="512" height="512" fill="{bg}"/>
  <g transform="translate({256 + shift} 256) scale(.88) translate(-256 -258)">
{inner}
  </g>
</svg>
'''

def head(cx, cy, fill):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="68" ry="56" transform="rotate(-20 {cx} {cy})" fill="{fill}"/>'

def flag(x, y, fill):
    # bandierina: parte dal gambo, si allarga a destra e rientra a punta
    # il contorno arrotondato ammorbidisce la punta
    return (f'<path fill="{fill}" stroke="{fill}" stroke-width="6" stroke-linejoin="round" '
            f'd="M{x} {y + 4}c30 36 116 66 107 134-2 17-9 31-21 42 4-34-14-70-86-116z"/>')

# A — Rifinita: come oggi (croce dietro, nota accanto), geometria pulita
A = f'''    <rect x="234" y="60" width="32" height="330" rx="16" fill="{GOLD}"/>
    <rect x="152" y="134" width="196" height="32" rx="16" fill="{GOLD}"/>
    <path fill="{WINE}" d="M266 200a8 8 0 0 1 8-8h16v184h-24z"/>
    {flag(290, 192, WINE)}
    {head(226, 398, WINE)}'''

# B — Unita: il braccio verticale della croce è il gambo della nota
def B(cross, note):
    return f'''    <path fill="{cross}" d="M240 76a16 16 0 0 1 32 0v298h-32z"/>
    <rect x="158" y="134" width="196" height="32" rx="16" fill="{cross}"/>
    {flag(272, 194, note)}
    {head(208, 396, note)}'''

files = {
    'logo-a-rifinita.svg': svg(CREAM, A, -8),
    'logo-b-unita.svg': svg(CREAM, B(GOLD, WINE)),
    'logo-c-notte.svg': svg(NAVY, B('#E6BD62', '#F7EBD3')),
}
for name, content in files.items():
    open(os.path.join(HERE, name), 'w').write(content)

cur = base64.b64encode(open(os.path.join(HERE, '../../public/icon-512.png'), 'rb').read()).decode()
items = [
    ('Oggi', 'Il logo attuale', f'<img src="data:image/png;base64,{cur}" alt="">'),
    ('A · Rifinita', 'Stessa composizione di oggi, forme pulite', files['logo-a-rifinita.svg']),
    ('B · Unita', 'La croce diventa il gambo della nota', files['logo-b-unita.svg']),
    ('C · Notte', 'La B sul blu della nuova grafica', files['logo-c-notte.svg']),
]
card = lambda t, d, g: f'''<section class="card"><div class="big ico">{g}</div><h2>{t}</h2><p>{d}</p>
<div class="row"><div class="wall light"><div class="ico s60">{g}</div><span>Canzoniere</span></div><div class="wall dark"><div class="ico s60">{g}</div><span>Canzoniere</span></div><div class="tiny"><div class="ico s32">{g}</div><div class="ico s20">{g}</div></div></div></section>'''
html = f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proposte logo — Canzoniere San Marco</title>
<style>
body{{margin:0;background:#f7f5f0;color:#1b1d24;font:16px/1.5 system-ui,sans-serif;padding:2rem clamp(1rem,4vw,3rem)}}
h1{{font:600 1.8rem Georgia,serif;margin:0 0 .3rem}} .lead{{color:#4b4f5c;margin:0 0 2rem;max-width:44rem}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1.2rem}}
.card{{background:#fff;border:1px solid #e5e1d6;border-radius:20px;padding:1.4rem}}
.card h2{{font-size:1.05rem;margin:1rem 0 .1rem}} .card p{{margin:0 0 1rem;color:#858996;font-size:.88rem}}
.ico{{border-radius:22.5%;overflow:hidden;aspect-ratio:1;box-shadow:0 1px 2px rgba(0,0,0,.08),0 10px 24px -10px rgba(22,35,61,.35)}}
.ico svg,.ico img{{display:block;width:100%;height:100%}}
.big{{width:min(100%,200px);margin:0 auto}}
.row{{display:flex;gap:.6rem;align-items:stretch}}
.wall{{flex:1;border-radius:14px;padding:.8rem .4rem .5rem;display:flex;flex-direction:column;align-items:center;gap:.3rem;font-size:.68rem}}
.wall.light{{background:linear-gradient(160deg,#dfe9f3,#f3e7da)}} .wall.dark{{background:linear-gradient(160deg,#1c2536,#0d1119);color:#fff}}
.s60{{width:60px}} .s32{{width:32px;border-radius:7px}} .s20{{width:20px;border-radius:5px;box-shadow:none}}
.tiny{{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;padding:0 .3rem}}
</style></head><body><h1>Proposte per il logo</h1><p class="lead">Stessa idea di oggi (croce + nota) e stessi colori. Sotto ogni proposta: come appare sulla schermata Home, chiara e scura, e in piccolo.</p>
<div class="grid">{''.join(card(*i) for i in items)}</div></body></html>'''
open(os.path.join(HERE, 'index.html'), 'w').write(html)
print('ok')
