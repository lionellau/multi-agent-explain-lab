# Security Review — Multi-Agent Explain Lab

Date: 2026-06-03. The app is a static, client-side React + Vite site. No backend, no auth, no third-party APIs, no user accounts, no persisted data, no real AI inference.

## Threat surface

| Surface | Status |
|---|---|
| User text input | None beyond local UI state (step index, slider values, toggles). Rendered through React text nodes only — no `dangerouslySetInnerHTML`, no `innerHTML`. React auto-escapes. |
| Numeric input (sliders) | Bounded by `min`/`max`, parsed numerically. |
| Clipboard (Takeaway chapter) | Writes only — copies a card/prompt the user generated, via `navigator.clipboard.writeText` with a hidden-textarea `execCommand` fallback. The app never *reads* the clipboard. |
| External network calls | **None.** No `fetch`, no `XMLHttpRequest`, no analytics, no remote fonts. |
| Secrets / API keys | **None in repo.** No model API, no auth, no tokens. |
| File uploads | **None.** No upload UI exists. |
| Authentication | **None required.** The app has no user-specific data. |
| Persisted state | **None.** No localStorage, no cookies, no IndexedDB. |
| Third-party scripts | **None.** All dependencies are bundled at build time. |

## Mitigations applied

- **Content Security Policy** set in the Vite dev/preview servers (`vite.config.ts`) and as `public/_headers` for static hosts that read it (Netlify / Cloudflare Pages / Vercel format):
  - `default-src 'self'` — only same-origin content by default
  - `script-src 'self'` in prod (no eval; dev adds `'unsafe-eval'`/`'unsafe-inline'` for HMR only)
  - `style-src 'self' 'unsafe-inline'` — required for React inline `style` attributes
  - `img-src 'self' data: blob:` — data/blob URLs for inline SVG and screenshots
  - `connect-src 'self'` in prod (no remote APIs); dev allows `ws:` for HMR only
  - `frame-ancestors 'none'` — clickjacking protection
  - `form-action 'none'` — no form submissions exist
  - `object-src 'none'` — no plugins/embeds
- **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**, **Referrer-Policy: no-referrer**
- **Permissions-Policy** — camera, microphone, geolocation, payments all denied
- **Strict-Transport-Security** (via `_headers`) — forces HTTPS on hosts that honor it

> Note: GitHub Pages does not apply custom response headers, so on the live Pages
> deployment the CSP is advisory (documented here and enforced on dev/preview and on
> header-aware hosts). The site makes no network calls regardless, so the practical
> surface stays minimal.

## Dependency audit

Production dependencies are minimal and official:

- `react`, `react-dom`, `react-router-dom`

No 3D, no state library, no network client, no analytics SDK. (Earlier scaffolding pulled in Three.js; it was unused and has been removed.)

## Manual review notes

- Searched `src/` for `dangerouslySetInnerHTML` / `innerHTML` / `eval(` / `new Function` / `document.write` / `srcDoc` → **0 hits**.
- Searched the repo for hardcoded keys / passwords / tokens / private keys → **0 hits** (the only "key" in the content is the conceptual *idempotency key*).
- Searched `src/` for `fetch` / `XMLHttpRequest` / remote URLs → **0 hits**. The framework links in the content are static `href`s, not runtime calls.
- All user-facing strings flow through JSX children (auto-escaped), never via raw HTML injection.

## Out of scope (no surface in this app)

SQL injection, auth bypass, CSRF, session management, rate limiting, file-upload validation, wallet/blockchain code — none of these exist here.

## Verdict

**Cleared for deployment as a static site.** No backend means no server-side attack vectors; the client makes no network calls and stores nothing.
