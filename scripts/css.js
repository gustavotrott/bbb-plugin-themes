// Builds dist/<theme>/theme.css: the same styles as the plugin, as one static
// stylesheet for BigBlueButton's custom style URL (public.app.customStyleUrl in
// settings.yml, or userdata-bbb_custom_style_url on /join).
// Each theme's index.tsx lists its stylesheets in order; they are joined into one
// file, local images become data URIs and @import rules move to the top.
// Build only some of them with: node scripts/css.js cozy,kids
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const all = fs.readdirSync(path.join(root, 'themes'))
  .filter((t) => fs.existsSync(path.join(root, 'themes', t, 'manifest.json')));
const themes = process.argv[2] ? process.argv[2].split(',') : all;

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

function inline(file) {
  const dir = path.dirname(file);
  return fs.readFileSync(file, 'utf8').replace(/url\((['"]?)(\.{1,2}\/[^'")]+)\1\)/g, (m, q, ref) => {
    const asset = path.resolve(dir, ref);
    const type = MIME[path.extname(asset)];
    if (!type) throw new Error(`${file}: no MIME type for ${ref}`);
    return `url("data:${type};base64,${fs.readFileSync(asset).toString('base64')}")`;
  });
}

themes.forEach((theme) => {
  const dir = path.join(root, 'themes', theme);
  const sheets = [...fs.readFileSync(path.join(dir, 'index.tsx'), 'utf8').matchAll(/^import '([^']+\.css)';/gm)]
    .map((m) => path.resolve(dir, m[1]));
  const imports = [];
  const body = sheets.map((file) => inline(file).replace(/^@import[^;]+;\s*\n?/gm, (rule) => {
    imports.push(rule.trim());
    return '';
  }).trim()).join('\n\n');
  const out = path.join(root, 'dist', theme);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'theme.css'), [
    `/* ${pkg.name} ${pkg.version}: ${theme} theme. ${pkg.license} license. */`,
    ...imports,
    '',
    body,
    '',
  ].join('\n'));
  console.log(`dist/${theme}/theme.css`, `${Math.round(fs.statSync(path.join(out, 'theme.css')).size / 1024)} KB`);
});
