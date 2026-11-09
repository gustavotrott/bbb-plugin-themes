// Builds each theme as one static stylesheet for BigBlueButton's custom style
// URL (public.app.customStyleUrl in settings.yml, or userdata-bbb_custom_style_url
// on /join). A theme is a folder in themes/ with a theme.json; its stylesheets,
// in order, are shared/base.css, shared/dark.css (if "dark" is true) and its
// own theme.css. They are joined into one file, local images become data URIs
// and @import rules move to the top.
//
//   node scripts/css.js [cozy,kids]    dist/<theme>/theme.css, for the newest BigBlueButton,
//                                      plus the frozen stylesheets for older versions,
//                                      copied as they are from versions/<theme>/<version>/
//   node scripts/css.js --root <dir> --version 4.0.3
//                                      builds the checkout in <dir> (another branch) into
//                                      dist/<theme>/4.0.3/theme.css
//
// Checkouts from before theme.json (one plugin per theme) have no theme.json;
// there each theme's index.tsx imports its stylesheets in order.
//
// Only writes files: whatever webpack put in dist/ stays.
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const root = path.resolve(opt('--root') || repo);
const version = opt('--version');
const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const has = (theme, file) => fs.existsSync(path.join(root, 'themes', theme, file));
const all = fs.readdirSync(path.join(root, 'themes'))
  .filter((t) => has(t, 'theme.json') || (has(t, 'index.tsx') && has(t, 'manifest.json')))
  .sort();
const themes = args[0] ? args[0].split(',') : all;

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

// The theme's stylesheets, in the order the plugin applies them
function sheets(theme) {
  const dir = path.join(root, 'themes', theme);
  if (has(theme, 'theme.json')) {
    const { dark } = JSON.parse(fs.readFileSync(path.join(dir, 'theme.json'), 'utf8'));
    return [
      path.join(root, 'shared', 'base.css'),
      ...(dark ? [path.join(root, 'shared', 'dark.css')] : []),
      path.join(dir, 'theme.css'),
    ];
  }
  return [...fs.readFileSync(path.join(dir, 'index.tsx'), 'utf8').matchAll(/^import '([^']+\.css)';/gm)]
    .map((m) => path.resolve(dir, m[1]));
}

function build(theme) {
  const imports = [];
  const body = sheets(theme).map((file) => inline(file).replace(/^@import\b.*;[ \t]*\n?/gm, (rule) => {
    imports.push(rule.trim());
    return '';
  }).trim()).join('\n\n');
  return (label) => [`/* ${pkg.name} ${pkg.version}: ${theme} theme for BigBlueButton ${label}. ${pkg.license} license. */`, ...imports, '', body, ''].join('\n');
}

function write(file, css) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, css);
  console.log(path.relative(repo, file), `${Math.round(css.length / 1024)} KB`);
}

themes.forEach((theme) => {
  const css = build(theme);
  const out = path.join(repo, 'dist', theme);
  if (version) {
    write(path.join(out, version, 'theme.css'), css(version));
    return;
  }
  write(path.join(out, 'theme.css'), css('4.0.1 or later'));
  // Older client versions: stylesheets frozen when that version was current
  const frozen = path.join(repo, 'versions', theme);
  if (fs.existsSync(frozen)) {
    fs.cpSync(frozen, out, { recursive: true });
    console.log(`dist/${theme}/: ${fs.readdirSync(frozen).join(', ')} (frozen)`);
  }
});
