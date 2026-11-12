# Redesign handoff ("built from the ground line")

Plan: `~/.claude-at/plans/nothing-related-to-woocommerce-warm-nova.md`. Stopped on 2026-11-11 at the user's request, before the last decision and the final review pass.

## State
- The redesign is implemented in `web/` and published to `pocketbase/pb_public/` (last build: 20 pages, no warnings).
- The project is not a git repo, so nothing is committed. The original files are in `scratch/before-redesign/` (`src/` and `astro.config.mjs`).
- PocketBase must be running to build: `cd pocketbase && ./pocketbase serve --indexFallback=false`, then `scripts/rebuild.sh`.

## What was built
- Tokens, Archivo (self-hosted via Astro's fonts API, one variable file, width axis 62-100, weight 400-800), left section heads with orange tick, image-led service cards, hero on the level line, short left banner, vertical/horizontal working-plan line.
- Motion: hero load sequence, cross-page view transitions with a per-service photo morph, `.rise` photos on scroll, working-plan line draw, tab arches rising, card zoom, button sweep, mobile menu slide.
- Removed the two flagged tells (`.tab-panel` side stripe, `.plan-icon` top border).
- Beyond the plan, small: carousel arrows moved into the section head so cards align with the heading; dropped a CSS border on the contact photo that doubled the outline already baked into the image; `main > .section:first-child` padding so the 404 page clears the header.

## Verified (Playwright + Lighthouse CLI; the Chrome DevTools MCP was locked by another session's Chrome)
- Screenshots reviewed: home at 1440 and 390; about, services, one service, contact at 1440; 404; mobile menu.
- Lighthouse 13.4.1 mobile: Accessibility 100, Best Practices 100, SEO 100 on home and about. CLS 0.
- Reduced motion: 0 running animations, nothing clipped, no view transition.
- `@supports` block removed: all photos and the plan line fully visible.
- Card click morphs into the detail hero, back restores scroll. Tabs work by click and arrow keys on home and about. Carousel arrows scroll.
- Contact form: submit flow verified with the request intercepted. No real message was sent, because the hook emails the company address when SMTP is on.

## Open decision: the font preload costs LCP
Measured under DevTools Slow 4G + 4x CPU, phone viewport, cold cache (stable to about 10 ms):

| Variant | LCP | FCP |
|---|---|---|
| Old design | 1.76 s | 1.48 s |
| New, with font preload (current) | 2.04 s | 1.62 s |
| New, without preload | 1.79 s | 1.50 s |
| New, no web font at all | 1.78 s | 1.51 s |
| New, hero photo animation removed | 2.04 s | 1.61 s |

- The current build passes the plan's 2.5 s limit but is 0.28 s slower than the old design. The whole gap is the preloaded 90 KB font competing with the hero photo.
- Fix: in `web/src/components/Layout.astro` change `<Font cssVariable="--font-archivo" preload />` to `<Font cssVariable="--font-archivo" />`, then rebuild. Trade-off: first-time visitors see the fallback font for a moment before Archivo swaps in. The plan asked for preload, so this is the user's call.
- Lighthouse's simulated numbers disagree with the real ones here: it reports LCP 3.3 s for the new home in every variant and 3.0 s for the old design (performance 92 vs 95), and it scores FCP worse without the preload. The plan's "2.25 s" baseline was not produced by this method.

## Not done yet
- Review the 390px captures of services, service detail and contact (taken, not looked at), and retake after the last fixes.
- Lighthouse on services, service detail and contact.
- A real contact-form submission, if wanted.

## Gotcha worth knowing
The build's CSS minifier folds `animation-timeline` into the `animation` shorthand, which browsers reject. That is why the scroll timelines in `global.css` are written as `var(--tl, view())` and `var(--tl, --plan)`. Do not "simplify" them.
