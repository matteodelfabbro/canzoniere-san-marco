"""Genera index.html dalla bozza template.html iniettando i dati reali dei canti."""
import json, glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
HERE = os.path.dirname(os.path.abspath(__file__))
idx = json.load(open(os.path.join(ROOT, 'public/data/songs-index.json')))
tags = json.load(open(os.path.join(ROOT, 'public/data/songs-tags.json')))
index = [{k: s.get(k, '') for k in ('id', 'numero', 'title', 'sub', 'search')} for s in idx]
songs = {}
for s in idx:
    p = os.path.join(ROOT, 'public/songs', s['id'] + '.json')
    if os.path.exists(p):
        d = json.load(open(p))
        songs[s['id']] = {'key': d.get('key'), 'capo': d.get('capo'), 'lines': d['lines']}
dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
t = open(os.path.join(HERE, 'template.html')).read()
t = (t.replace('/*INDEX*/[]', dump(index))
       .replace('/*TAGS*/{}', dump({k: {'tags': v['tags'], 'groups': v['groups']} for k, v in tags.items()}))
       .replace('/*SONGS*/{}', dump(songs)))
open(os.path.join(HERE, 'index.html'), 'w').write(t)
print('ok', len(songs), 'canti,', len(t) // 1024, 'KB')
