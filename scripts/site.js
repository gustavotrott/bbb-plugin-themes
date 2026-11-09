// Builds the GitHub Pages site: dist/ as it is (the plugin and every
// stylesheet), a screenshot per theme and an index page with the plugin
// manifest URL and a card per theme. Run it after npm run build-bundle.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const site = path.join(root, 'site');
if (!fs.existsSync(path.join(dist, 'manifest.json'))) {
  throw new Error('dist/manifest.json is missing: run npm run build-bundle first');
}
fs.rmSync(site, { recursive: true, force: true });
fs.cpSync(dist, site, { recursive: true });

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
// Every theme with metadata whose stylesheets were built
const themes = fs.readdirSync(path.join(root, 'themes')).sort()
  .filter((id) => fs.existsSync(path.join(root, 'themes', id, 'theme.json'))
    && fs.existsSync(path.join(dist, id, 'theme.css')))
  .map((id) => ({ id, ...JSON.parse(fs.readFileSync(path.join(root, 'themes', id, 'theme.json'), 'utf8')) }));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// A URL next to this page, with a Copy button. "what" names the URL for
// screen readers ("Cozy stylesheet URL") and in the announcement.
const copy = (url, what) => `<dd class="copy"><code data-url="${url}">${url}</code><button type="button" data-url="${url}" data-what="${esc(what)}" hidden><span class="label">Copy</span><span class="sr"> ${esc(what)}</span></button></dd>`;

const cards = themes.map(({ id, name, description }) => {
  const shot = path.join(root, 'themes', id, 'screenshot.jpg');
  const img = fs.existsSync(shot)
    ? `<img src="${id}/screenshot.jpg" alt="A meeting in the ${esc(name)} theme" width="1440" height="900" loading="lazy">`
    : '';
  if (img) fs.copyFileSync(shot, path.join(site, id, 'screenshot.jpg'));
  return `<li class="card">
  ${img}
  <div class="body">
    <h3>${esc(name)}</h3>
    <p>${esc((description && description.en) || '')}</p>
    <dl>
      <div><dt>Id for <code>defaultTheme</code></dt><dd><code>${id}</code></dd></div>
      <div><dt>Stylesheet</dt>${copy(`${id}/theme.css`, `${name} stylesheet URL`)}</div>
      <div><dt>Stylesheet by BigBlueButton version</dt><dd><ul class="versions">
        <li><a href="${id}/4.0.3/theme.css">4.0.3+</a></li>
        <li><a href="${id}/4.0.1/theme.css">4.0.1-4.0.2</a></li>
        <li><a href="${id}/4.0.0/theme.css">4.0.0</a></li>
      </ul></dd></div>
    </dl>
  </div>
</li>`;
}).join('\n');

fs.writeFileSync(path.join(site, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BigBlueButton themes</title>
<style>
:root { --bg: #f6f6f3; --card: #fff; --fg: #1d2125; --muted: #5a616b; --line: #d9d9d2; --accent: #0f6cbf; --on-accent: #fff; color-scheme: light dark; }
@media (prefers-color-scheme: dark) { :root { --bg: #151618; --card: #1e2023; --fg: #ecedee; --muted: #a9aeb4; --line: #3a3d42; --accent: #7db2e0; --on-accent: #0b1622; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.55 system-ui, sans-serif; }
header, main, footer { max-width: 1180px; margin: 0 auto; padding: 0 16px; }
header { padding-top: 40px; }
main { padding-bottom: 48px; }
footer { padding-bottom: 40px; color: var(--muted); font-size: .9rem; }
h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.2; margin: 0 0 8px; }
h2 { font-size: 1.4rem; margin: 40px 0 12px; }
h3 { margin: 0; font-size: 1.15rem; }
p { margin: 0; }
.lead, .note { color: var(--muted); max-width: 70ch; }
.note { margin-top: 12px; }
.plugin { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
.grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 20px; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.card img { width: 100%; height: auto; display: block; border-bottom: 1px solid var(--line); }
.body { padding: 16px; display: grid; gap: 8px; }
.body > p { color: var(--muted); font-size: .95rem; }
dl { margin: 4px 0 0; display: grid; gap: 10px; }
dt { font-size: .85rem; color: var(--muted); }
dd { margin: 2px 0 0; }
.copy { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
code { font-size: .85rem; overflow-wrap: anywhere; }
dd > code, .copy code { background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; display: inline-block; }
.copy code { flex: 1 1 14em; min-width: 0; }
button { font: inherit; font-size: .9rem; min-height: 36px; padding: 6px 14px; border-radius: 6px; border: 1px solid var(--accent); background: var(--accent); color: var(--on-accent); cursor: pointer; }
.versions { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: .9rem; }
.versions a { display: inline-block; padding: 2px 0; }
a { color: var(--accent); }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>
</head>
<body>
<header>
<h1>BigBlueButton themes</h1>
<p class="lead">One plugin for the BigBlueButton 4.0 HTML5 client with ${themes.length} themes and a theme picker (v${esc(pkg.version)}, for BigBlueButton 4.0.1 or later). Each theme is also a plain stylesheet for <code>customStyleUrl</code>. To install it on your own server, see the <a href="https://github.com/gustavotrott/bbb-plugin-themes#install-on-your-server">README</a>.</p>
</header>
<main>
<section aria-labelledby="plugin">
<h2 id="plugin">The plugin</h2>
<div class="plugin">
<dl><div><dt>Plugin manifest</dt>${copy('manifest.json', 'plugin manifest URL')}</div></dl>
<p class="note">To try it, pass the manifest on a meeting's <code>create</code> call as <code>pluginManifests=[{"url":"&lt;manifest&gt;"}]</code>, or add it to <code>pluginManifests</code> in <code>bbb-web.properties</code> for every meeting. Everyone in the meeting can then pick a theme from the client's options menu; the choice applies at once and is saved in their browser for every meeting on that server. In <code>bbb-html5.yml</code> you can set the <code>defaultTheme</code>, offer only some <code>themes</code>, or hide the picker with <code>allowUserChoice: false</code>.</p>
</div>
</section>
<section aria-labelledby="themes">
<h2 id="themes">Themes</h2>
<ul class="grid">
${cards}
</ul>
</section>
</main>
<footer>
<p>bbb-plugin-themes v${esc(pkg.version)}, ${esc(pkg.license)} license. <a href="https://github.com/gustavotrott/bbb-plugin-themes">Source on GitHub</a>.</p>
</footer>
<p id="status" class="sr" role="status" aria-live="polite"></p>
<script>
const base = new URL('.', location.href).href;
const status = document.getElementById('status');
const say = (text) => {
  status.textContent = '';
  setTimeout(() => { status.textContent = text[0].toUpperCase() + text.slice(1); }, 100);
};
document.querySelectorAll('code[data-url]').forEach((c) => { c.textContent = base + c.dataset.url; });
document.querySelectorAll('button[data-url]').forEach((b) => {
  const label = b.querySelector('.label');
  b.hidden = false;
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(base + b.dataset.url);
      label.textContent = 'Copied';
      say(b.dataset.what + ' copied.');
    } catch (e) {
      // No clipboard access (an http page, or blocked): select the URL instead
      const range = document.createRange();
      range.selectNodeContents(b.previousElementSibling);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      label.textContent = 'Selected';
      say(b.dataset.what + ' selected. Press Control+C or Command+C to copy it.');
    }
    setTimeout(() => { label.textContent = 'Copy'; }, 2000);
  });
});
</script>
</body>
</html>
`);
console.log('site:', themes.map((t) => t.id).join(', '));
