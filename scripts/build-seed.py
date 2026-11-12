"""Build seed.json (clean real content + local image paths) from wp.json. Usage: build-seed.py <wp.json> <uploads_dir> <out.json>"""
import html, json, os, re, sys

wp = json.load(open(sys.argv[1]))
UP = os.path.realpath(sys.argv[2])
P = {p['ID']: p for p in wp['posts']}


def local(url):
    """Map a WP/theme-demo upload URL to the original file in the export (drops -WxH thumbnail suffix)."""
    if not url:
        return None
    rel = re.sub(r'^https?://[^/]+(/wp/buildexo)?/wp-content/uploads/', '', url.strip().strip('"'))
    path = os.path.join(UP, rel)
    orig = re.sub(r'-\d+x\d+(\.\w+)$', r'\1', path)
    for p in (orig, path):
        if os.path.isfile(p):
            return p
    raise SystemExit(f'missing upload: {url}')


def el(pid):
    def walk(els):
        for e in els:
            yield e
            yield from walk(e.get('elements') or [])
    return list(walk(json.loads(P[pid]['meta']['_elementor_data'])))


def widgets(pid, kind):
    return [e['settings'] for e in el(pid) if e.get('widgetType') == kind]


def url(v):
    return v.get('url') if isinstance(v, dict) else v


def text(s):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', s or '')).split())


# typos carried over from the old site
FIX = {'I nvolve': 'Involve', 'Satifaction': 'Satisfaction', 'emploies': 'employees', 'Solition': 'Solution', 'high -Quality': 'high-quality', 'To community': 'to community'}


def fix(s):
    for a, b in FIX.items():
        s = s.replace(a, b)
    return s


# ---------- services ----------
services = []
for p in sorted((p for p in P.values() if p['type'] == 'service' and p['status'] == 'publish'), key=lambda p: p['ID']):
    body, _, gallery_html = p['content'].partition('<div class="images">')
    gallery = list(dict.fromkeys(local(u) for u in re.findall(r'src="([^"]+)"', gallery_html)))
    thumb = P[int(p['meta']['_thumbnail_id'])]['meta']['_wp_attached_file']
    body = fix(body.strip())
    services.append({
        'slug': p['slug'], 'title': p['title'],
        'body': ''.join(f'<p>{line.strip()}</p>' for line in body.split('\n') if line.strip()),
        'image': local(thumb), 'gallery': gallery, 'sort': len(services) + 1,
        'seo_title': p['meta'].get('_yoast_wpseo_title') or '',
        'seo_description': (p['meta'].get('_yoast_wpseo_metadesc') or text(body))[:158].rsplit(' ', 1)[0] if len(text(body)) > 158 else text(body),
    })

# ---------- home ----------
H = 1631
tabs = widgets(H, 'turner_feature_tab_two')[0]['features2']
showcase = [{'title': t['tab_title'].strip(), 'images': [local(url(t['image1'])), local(url(t['image2']))], 'sort': i + 1} for i, t in enumerate(tabs)]
clients_raw = widgets(H, 'turner_client_carousel')[0]['slides']
# names read off the logos, in carousel order
NAMES = ['Rawafid Industrial', 'Real Estate Development Fund (REDF)', 'Ministry of Municipal and Rural Affairs & Housing',
         'Water Transmission and Technologies Co.', 'SAS Systems Engineering', 'Saudi Water Authority', 'Water Desalination',
         'First Fix', 'ICAD']
clients = []
for i, c in enumerate(clients_raw):
    link = (url(c.get('btn_link')) or '').lstrip('-')
    link = link if link.startswith('http') else ''
    clients.append({'name': NAMES[i], 'url': link, 'logo': local(url(c['block_img'])), 'sort': i + 1})
intro = widgets(H, 'turner_hero_title')[0]
features = [fix(f['title']) for f in widgets(H, 'turner_feature_list')]
plan = widgets(H, 'turner_working_plan')[0]
steps = [{'no': s['block_no'].strip(), 'title': s['block_title'].strip(), 'icon': s['icon']['value'].replace('flaticon-', '').strip()} for s in plan['slide']]
intro_img = [url(e['settings']['image']) for e in el(H) if e.get('widgetType') == 'image'][0]

pages = [
    {'slug': 'home', 'title': 'Home',
     'seo_title': 'Right Standard Contracting Company | Construction, Infrastructure & MEP in Saudi Arabia',
     'seo_description': 'Right Standard Contracting Company (RSC) delivers construction, infrastructure, MEP and low-current projects across Saudi Arabia with quality and precision.',
     'hero_image': local('2025/01/anne-nygard-2LgJiWdDdO4-unsplash-scaled.jpg'),
     'image': local(intro_img), 'image2': local('2023/09/cta-bg1.jpg'),
     'data': {
         'hero': {'kicker': 'Right Standard, Is your Right Decision', 'title1': 'Contracting', 'title2': 'Company',
                  'text': 'Welcome to Right Standard Contracting Company, Saudi Arabia’s leading construction firm.', 'button': 'More Explore', 'link': '/about/'},
         'intro': {'kicker': 'Welcome to Right Standard Contracting Company', 'title': 'Saudi Arabia’s leading construction firm',
                   'text': text(intro['text']), 'features': features},
         'services': {'kicker': 'Welcome to Right Standard Contracting Company', 'title': 'Our Services That We Provide'},
         'cta': {'outline': 'Your Renovation', 'title': 'Starts Here', 'button': 'More Explore', 'link': '/contact/'},
         'clients': {'title': 'Our Clients'},
         'showcase': {'kicker': 'Bigger, Better, Faster', 'title': 'Leading way in contracting'},
         'plan': {'kicker': fix(plan['sub_title']), 'title': 'Our Working Plan', 'steps': steps},
     }},
]

A = 22
about_html = [s['title'] for s in widgets(A, 'heading') if len(s.get('title', '')) > 200][0]
tabs_about = [{'title': f['block_title'], 'html': fix(f['block_text'])} for f in widgets(A, 'turner_accordian')[0]['faqs']]
pages.append({'slug': 'about', 'title': 'About Us',
              'seo_title': 'About Us | Right Standard Contracting Company',
              'seo_description': P[A]['meta'].get('_yoast_wpseo_metadesc') or '',
              'image': local(url(widgets(A, 'turner_float_image')[0]['image1'])),
              'body': fix(about_html),
              'data': {'kicker': 'Founder Message', 'title': 'Welcome to Right Standard Contracting Company', 'tabs': tabs_about}})
pages.append({'slug': 'services', 'title': 'Our Services',
              'seo_title': 'Our Services | Right Standard Contracting Company',
              'seo_description': 'Concrete repair, waterproofing, infrastructure, asphalt, MEP, HVAC, electrical, fire alarm, CCTV and security systems by Right Standard Contracting Company in KSA.',
              'data': {'kicker': 'Great Experience in building', 'title': 'We Provide Effective Solutions',
                       'cta': {'text': 'Offering High Quality Construction Solutions', 'title': 'Build Your Dream Now', 'link': '/contact/'}}})
C = 42
map_src = re.search(r'src="([^"]+)"', widgets(C, 'turner_google_map')[0]['google_map_code']).group(1)
pages.append({'slug': 'contact', 'title': 'Contact Us',
              'seo_title': 'Contact Us | Right Standard Contracting Company',
              'seo_description': 'Get in touch with Right Standard Contracting Company in Saudi Arabia. Call +966 538 537 537 or send us a message for your next construction project.',
              'image': local(url(widgets(C, 'turner_float_image')[0]['image1'])),
              'image2': local('2023/07/contact_bg.jpg'),
              'data': {'kicker': 'Contact us', 'title': 'Keep In Touch', 'form_title': 'Send Us a Message', 'info_title': 'Get In Touch With Us', 'map_src': map_src}})

settings = {
    'site_name': 'Right Standard Contracting Company', 'short_name': 'RSC', 'tagline': 'Right Standard, is your Right Decision',
    'phone': '+966 538 537 537', 'whatsapp_url': 'https://api.whatsapp.com/send?phone=966538537537&text=Hello',
    'email': 'info@RightsSTD.com', 'location': 'KSA',
    'x_url': 'https://x.com/RightSTD', 'linkedin_url': 'https://www.linkedin.com/company/right-standard-contracting-company/',
    'instagram_url': 'https://www.instagram.com/rightstd',
    'logo': local('2024/12/logo-1.svg'), 'logo_white': local('2024/12/logo-white-1.svg'), 'favicon': local('2024/12/logo-1.png'),
    'banner_image': local('revslider/slider-1/slider_bg1.jpg'),
    'profile_pdf': local('2025/02/Right-Standard-Company-Profile-2025.pdf'),
}

seed = {'settings': settings, 'pages': pages, 'services': services, 'clients': clients, 'showcase': showcase}
# self-check: real content complete
assert len(services) == 15 and all(s['image'] and s['body'] for s in services), 'services incomplete'
assert {p['slug'] for p in pages} == {'home', 'about', 'services', 'contact'}
assert len(clients) == 9 and len(showcase) == 4 and len(steps) == 4
json.dump(seed, open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
files = {v for v in re.findall(r'"(/[^"]+\.\w+)"', json.dumps(seed, ensure_ascii=False)) if v.startswith(UP)}
print(f'{len(services)} services, {len(pages)} pages, {len(clients)} clients, {len(showcase)} showcase, {len(files)} files, {sum(os.path.getsize(f) for f in files) / 1e6:.1f}MB')
