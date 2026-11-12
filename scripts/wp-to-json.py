"""Turn the AI1WM database.sql into wp.json (posts, meta, terms, options). Usage: wp-to-json.py <database.sql> <out.json>"""
import json, re, sys

ESC = {'n': '\n', 'r': '\r', 't': '\t', '0': '\0', 'Z': '\x1a', 'b': '\b'}
TABLES = {'posts', 'postmeta', 'terms', 'term_taxonomy', 'term_relationships', 'options', 'snippets'}

def parse_row(s, i):
    """Parse one '(v1,v2,...)' tuple starting at s[i]=='('; return (values, next index)."""
    assert s[i] == '('
    i += 1; vals = []
    while True:
        c = s[i]
        if c == "'":
            i += 1; buf = []
            while True:
                c = s[i]
                if c == '\\':
                    buf.append(ESC.get(s[i + 1], s[i + 1])); i += 2
                elif c == "'":
                    if s[i + 1:i + 2] == "'":
                        buf.append("'"); i += 2
                    else:
                        i += 1; break
                else:
                    buf.append(c); i += 1
            vals.append(''.join(buf))
        else:
            m = re.compile(r"[^,)]*").match(s, i)
            tok = m.group().strip(); i = m.end()
            vals.append(None if tok == 'NULL' else int(tok) if re.fullmatch(r'-?\d+', tok) else tok)
        if s[i] == ',':
            i += 1
        elif s[i] == ')':
            return vals, i + 1

def parse(path):
    rows = {t: [] for t in TABLES}
    head = re.compile(r"INSERT INTO `SERVMASK_PREFIX_(\w+)` VALUES ")
    for line in open(path, encoding='utf-8', errors='replace'):
        m = head.match(line)
        if not m or m.group(1) not in TABLES:
            continue
        i = m.end()
        while i < len(line) and line[i] == '(':
            v, i = parse_row(line, i)
            rows[m.group(1)].append(v)
            if line[i:i + 1] == ',':
                i += 1
    return rows

POST_COLS = ['ID', 'author', 'date', 'date_gmt', 'content', 'title', 'excerpt', 'status', 'cs', 'ps', 'pw', 'slug',
             'tp', 'pinged', 'modified', 'mod_gmt', 'cf', 'parent', 'guid', 'menu_order', 'type', 'mime', 'cc']

if __name__ == '__main__':
    r = parse(sys.argv[1])
    posts = {}
    for v in r['posts']:
        p = dict(zip(POST_COLS, v))
        posts[p['ID']] = {k: p[k] for k in ('ID', 'title', 'slug', 'content', 'excerpt', 'status', 'type', 'parent', 'menu_order', 'guid', 'mime', 'date')}
        posts[p['ID']]['meta'] = {}
    for meta_id, pid, key, val in r['postmeta']:
        if pid in posts:
            posts[pid]['meta'][key] = val
    terms = {t[0]: {'name': t[1], 'slug': t[2]} for t in r['terms']}
    tax = {tt[0]: {**terms.get(tt[1], {}), 'term_id': tt[1], 'taxonomy': tt[2], 'parent': tt[4]} for tt in r['term_taxonomy']}
    for obj, ttid, _ in r['term_relationships']:
        if obj in posts and ttid in tax:
            posts[obj].setdefault('terms', []).append(tax[ttid])
    opts = {o[1]: o[2] for o in r['options'] if not o[1].startswith('_transient') and not o[1].startswith('_site_transient')}
    json.dump({'posts': list(posts.values()), 'options': opts, 'snippets': r['snippets']}, open(sys.argv[2], 'w'), ensure_ascii=False)
    assert len(posts) == len(r['posts']) > 0, 'no posts parsed'
    print(len(posts), 'posts,', len(r['postmeta']), 'meta,', len(tax), 'terms,', len(opts), 'options,', len(r['snippets']), 'snippets')
