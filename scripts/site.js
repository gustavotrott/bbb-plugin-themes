// Builds the GitHub Pages site: dist/<theme>/ plus a screenshot and an index
// page that lists every theme with the manifest URL to copy.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
fs.rmSync(site, { recursive: true, force: true });
fs.cpSync(path.join(root, 'dist'), site, { recursive: true });

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const themes = fs.readdirSync(path.join(root, 'dist')).sort();
const ABOUT = {
  cozy: ['Cozy', 'Beige, earthy tones, soft sage green and round corners. Warm and less institutional.'],
  kids: ['Kids', 'Bright colours, chunky buttons and a playful font, for young children.'],
  light: ['Light', 'Airy and corporate, with an indigo accent, like Teams and Zoom in light mode.'],
  midnight: ['Midnight', 'The whole client in dark mode, on neutral graphite.'],
  moodle: ['Moodle', 'The colours, type and shapes of the Moodle Design System.'],
  school: ['School (K-12)', 'Legible and calm, with every tool in its own colour. For pupils of every age.'],
  synthwave: ['Synthwave', 'An 80s sunset, a neon grid floor and pink and cyan glow.'],
};
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const cards = themes.map((theme) => {
  const shot = path.join(root, 'themes', theme, 'screenshot.jpg');
  if (fs.existsSync(shot)) fs.copyFileSync(shot, path.join(site, theme, 'screenshot.jpg'));
  const [title, text] = ABOUT[theme] || [theme, ''];
  return `<article>
  <img src="${theme}/screenshot.jpg" alt="${esc(title)} theme" width="1440" height="900" loading="lazy">
  <div class="body">
    <h2>${esc(title)}</h2>
    <p>${esc(text)}</p>
    <div class="url"><code data-theme="${theme}"></code><button type="button" data-theme="${theme}">Copy</button></div>
  </div>
</article>`;
}).join('\n');

fs.writeFileSync(path.join(site, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BigBlueButton themes</title>
<style>
:root { --bg: #f6f6f3; --card: #fff; --fg: #1d2125; --muted: #5f6670; --line: #e2e2dc; --accent: #0f6cbf; color-scheme: light dark; }
@media (prefers-color-scheme: dark) { :root { --bg: #151618; --card: #1e2023; --fg: #ecedee; --muted: #a3a8ae; --line: #2f3236; --accent: #6fa7d9; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.55 system-ui, sans-serif; }
main { max-width: 1180px; margin: 0 auto; padding: 40px 16px 64px; }
h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 0 0 8px; }
.lead { color: var(--muted); max-width: 70ch; margin: 0 0 32px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 20px; }
article { background: var(--card); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
article img { width: 100%; height: auto; display: block; border-bottom: 1px solid var(--line); }
.body { padding: 16px; display: grid; gap: 8px; }
h2 { margin: 0; font-size: 1.15rem; }
p { margin: 0; color: var(--muted); font-size: .95rem; }
.url { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
code { flex: 1; min-width: 0; font-size: .78rem; background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; overflow-wrap: anywhere; }
button { font: inherit; font-size: .85rem; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--accent); background: var(--accent); color: #fff; cursor: pointer; }
a { color: var(--accent); }
</style>
</head>
<body>
<main>
<h1>BigBlueButton themes</h1>
<p class="lead">Theme plugins for BigBlueButton 4.0.1 or later (v${pkg.version}). To try one, pass its manifest on the meeting's <code>create</code> call as <code>pluginManifests=[{"url":"&lt;manifest&gt;"}]</code>. To install one on your server, see the <a href="https://github.com/gustavotrott/bbb-plugin-themes#install-on-your-server">README</a>.</p>
<div class="grid">
${cards}
</div>
</main>
<script>
const base = new URL('.', location.href).href;
document.querySelectorAll('code[data-theme]').forEach((c) => { c.textContent = base + c.dataset.theme + '/manifest.json'; });
document.querySelectorAll('button[data-theme]').forEach((b) => b.addEventListener('click', async () => {
  const text = base + b.dataset.theme + '/manifest.json';
  try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; } catch (e) { b.textContent = 'Select it'; }
  setTimeout(() => { b.textContent = 'Copy'; }, 1500);
}));
</script>
</body>
</html>
`);
console.log('site:', themes.join(', '));
