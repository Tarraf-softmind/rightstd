"""Debug helper: print an Elementor page's widget tree compactly. Usage: el-dump.py wp.json <post_id>"""
import json, sys
d = json.load(open(sys.argv[1])); P = {p['ID']: p for p in d['posts']}
def short(v):
    if isinstance(v, dict) and 'url' in v: return v['url']
    if isinstance(v, str): return v.strip()[:300]
    if isinstance(v, list): return [short(x) for x in v]
    if isinstance(v, dict): return {k: short(x) for k, x in v.items() if x not in ('', None, [], {})}
    return v
SKIP = ('_', 'typography', 'color', 'margin', 'padding', 'border', 'background_', 'size', 'align', 'width', 'height', 'gap', 'position', 'css', 'animation', 'hover', 'z_index', 'box_shadow', 'custom_', 'motion', 'sticky', 'flex', 'content_width', 'layout', 'structure')
def walk(els, depth=0):
    for e in els:
        s = e.get('settings') or {}
        keep = {k: short(v) for k, v in s.items() if not k.startswith(SKIP) and v not in ('', None, [], {}) and not any(x in k for x in ('typography', 'color', 'margin', 'padding', '_size', 'border', 'shadow', 'animation'))}
        bg = s.get('background_image', {}).get('url') if isinstance(s.get('background_image'), dict) else None
        print('  ' * depth + (e.get('widgetType') or e.get('elType')), json.dumps(keep, ensure_ascii=False)[:1500], ('BG=' + bg) if bg else '')
        walk(e.get('elements') or [], depth + 1)
walk(json.loads(P[int(sys.argv[2])]['meta']['_elementor_data']))
