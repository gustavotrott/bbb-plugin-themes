# BigBlueButton themes

Seven theme plugins for the BigBlueButton 4.0 HTML5 client. Each one changes colours, shapes, fonts and the background, and keeps the same layout fixes:

- full-height icon bar and sidebar
- [Lucide](https://lucide.dev) icons
- round avatars with a moderator crown and a presenter badge
- cameras that fill their tile, with a green ring on whoever speaks
- a keyboard focus ring, and reduced motion when the system asks for it

They are pure CSS and share one base derived from [bbb-plugin-flat-theme](https://github.com/gustavotrott/bbb-plugin-flat-theme). Each theme comes two ways:

- **As a plugin** (`pluginManifests`), the default.
- **As a plain stylesheet** (`customStyleUrl`): one static `theme.css` with the icons and backgrounds inlined, if you would rather not run a plugin. See [Use a theme as a custom style](#use-a-theme-as-a-custom-style-css-only).

> **The plugins require BigBlueButton 4.0.1 or later** (the static `bbb-*` classes). For 4.0.0, use a theme as a [custom style](#use-a-theme-as-a-custom-style-css-only). Use one theme at a time.

<table>
<tr><td width="50%"><a href="#cozy"><img src="themes/cozy/screenshot.jpg" alt="Cozy"><br><b>Cozy</b></a></td><td width="50%"><a href="#kids"><img src="themes/kids/screenshot.jpg" alt="Kids"><br><b>Kids</b></a></td></tr>
<tr><td width="50%"><a href="#light"><img src="themes/light/screenshot.jpg" alt="Light"><br><b>Light</b></a></td><td width="50%"><a href="#midnight"><img src="themes/midnight/screenshot.jpg" alt="Midnight"><br><b>Midnight</b></a></td></tr>
<tr><td width="50%"><a href="#synthwave"><img src="themes/synthwave/screenshot.jpg" alt="Synthwave"><br><b>Synthwave</b></a></td><td width="50%"><a href="#moodle"><img src="themes/moodle/screenshot.jpg" alt="Moodle"><br><b>Moodle</b></a></td></tr>
<tr><td width="50%"><a href="#school-k-12"><img src="themes/school/screenshot.jpg" alt="School (K-12)"><br><b>School (K-12)</b></a></td><td></td></tr>
</table>

_Camera images in the screenshots are illustrations. The fonts load from Google Fonts; without internet access the client falls back to its own font._

## Try a theme without installing

Every theme is hosted on GitHub Pages. Pass its manifest on the `create` call of a meeting, and that meeting loads the theme with nothing installed on the server:

```text
pluginManifests=[{"url":"https://gustavotrott.github.io/bbb-plugin-themes/cozy/manifest.json"}]
```

Replace `cozy` with `kids`, `light`, `midnight`, `synthwave`, `moodle` or `school`. You can try it from [API Mate](https://mconf.github.io/api-mate/) or your own integration (Moodle, Greenlight, Scalelite...).

The BigBlueButton server reads the manifest when the meeting is created, so it must reach `github.io`. The participants' browsers load the theme from there too. If the server already has a theme in its own `pluginManifests`, both load in the meeting.

## Install on your server

These steps install from the latest [release](https://github.com/gustavotrott/bbb-plugin-themes/releases/latest).

1. Download the theme into the plugins folder. For one theme (here `moodle`):

   ```bash
   THEME=moodle
   sudo mkdir -p /var/www/bigbluebutton-default/assets/plugins/bbb-plugin-$THEME-theme
   curl -fsSL https://github.com/gustavotrott/bbb-plugin-themes/releases/latest/download/bbb-plugin-$THEME-theme.tar.gz \
     | sudo tar xz --no-same-owner -C /var/www/bigbluebutton-default/assets/plugins/bbb-plugin-$THEME-theme
   ```

   Or all seven at once, each in its own `bbb-plugin-<theme>-theme` folder:

   ```bash
   curl -fsSL https://github.com/gustavotrott/bbb-plugin-themes/releases/latest/download/bbb-plugin-themes.tar.gz \
     | sudo tar xz --no-same-owner -C /var/www/bigbluebutton-default/assets/plugins
   ```

2. Add the manifest to `pluginManifests` in `/etc/bigbluebutton/bbb-web.properties`. If the line already lists other plugins, add the theme to the list and remove any other theme:

   ```properties
   pluginManifests=[{"url":"https://<your-server>/plugins/bbb-plugin-moodle-theme/manifest.json"}]
   ```

3. Restart bbb-web:

   ```bash
   sudo systemctl restart bbb-web
   ```

Meetings created from then on use the theme. To update, run step 1 again. No restart is needed.

You can skip the download and put the GitHub Pages manifest in `bbb-web.properties` instead. The theme then always follows the latest version on `main`.

## Use a theme as a custom style (CSS only)

The build also writes `dist/<theme>/theme.css`: the same theme as one static stylesheet, with the icons and backgrounds inlined as data URIs. The client adds it as a `<link rel="stylesheet">`, so nothing runs besides the CSS. Use the plugin or the stylesheet, not both, and only one theme at a time.

Pick the stylesheet for your BigBlueButton version (here for `moodle`; swap in any theme):

| BigBlueButton | Stylesheet |
|---|---|
| 4.0.3 or later (with [#26415](https://github.com/bigbluebutton/bigbluebutton/pull/26415)) | `https://gustavotrott.github.io/bbb-plugin-themes/moodle/4.0.3/theme.css` |
| 4.0.1 and 4.0.2 | `https://gustavotrott.github.io/bbb-plugin-themes/moodle/4.0.1/theme.css` |
| 4.0.0 | `https://gustavotrott.github.io/bbb-plugin-themes/moodle/4.0.0/theme.css` |

`https://gustavotrott.github.io/bbb-plugin-themes/<theme>/theme.css` always follows the newest version on `main`. The release tarballs include the stylesheets next to the plugin.

The 4.0.0 and 4.0.1 stylesheets are frozen in [`versions/`](versions): new changes only go to the newest version. The 4.0.0 ones reach the client through the `data-test` attributes and ids that 4.0.0 already had, so a few details need a newer client: the presenter badge in the user list, the color of your own chat messages, the ring on the avatar of whoever speaks and the unread dot on the icon bar. The themes themselves (the plugins) still need 4.0.1.

**For one user**, pass it on the `join` call:

```text
userdata-bbb_custom_style_url=https://gustavotrott.github.io/bbb-plugin-themes/moodle/theme.css
```

**For the whole server**, host it yourself (or use the GitHub Pages URL):

1. Download the theme as in step 1 of [Install on your server](#install-on-your-server). The folder now holds `theme.css` (newest version) and `4.0.0/theme.css`, `4.0.1/theme.css` for older clients.

2. Set `public.app.customStyleUrl` in `/etc/bigbluebutton/bbb-html5.yml`:

   ```yaml
   public:
     app:
       customStyleUrl: https://<your-server>/plugins/bbb-plugin-moodle-theme/4.0.1/theme.css   # the folder for your version
   ```

3. Restart BigBlueButton (`sudo bbb-conf --restart`). The client settings are stored per meeting by akka-apps, which only reads `bbb-html5.yml` on startup.

Meetings created from then on load the stylesheet. To update, run step 1 again.

## Themes

### Cozy

Beige, earthy tones, soft sage green and round corners: a warm, less institutional look.

![Cozy theme](themes/cozy/screenshot.jpg)

- Linen stage with soft blots of color and a few branches near the corners (`themes/cozy/scene.svg`).
- Sage icon bar, cream panels, oat and sage chat bubbles, terracotta for "muted" and "leave".
- Round "pebble" buttons in the action bar, 16px corners, a sidebar that reads as a card on the table.
- Panel titles in Fraunces (a soft serif), text in Nunito Sans (Google Fonts).
- Avatar colors toned down to earthy hues.

**Best for:** Community and condo meetings, audiences that find "office" screens cold.

Manifest: `https://gustavotrott.github.io/bbb-plugin-themes/cozy/manifest.json`

Stylesheet: `https://gustavotrott.github.io/bbb-plugin-themes/cozy/<4.0.0|4.0.1|4.0.3>/theme.css`

### Kids

Bright colors, chunky round buttons and a playful font, for classes with children.

![Kids theme](themes/kids/screenshot.jpg)

- A sky with clouds, a smiling sun and hills with flowers (`themes/kids/scene.svg`).
- Every icon in the icon bar is a colored block (yellow users, green chat, pink notes...), so children can find "the green one".
- 50px chunky action bar buttons that press down, orange accent.
- Avatars as stickers with a white border, cameras as polaroid frames.
- Baloo 2, a rounded and bold font (Google Fonts), and a little bounce when menus open.

**Best for:** Preschool and the first school years (up to about 9).

Manifest: `https://gustavotrott.github.io/bbb-plugin-themes/kids/manifest.json`

Stylesheet: `https://gustavotrott.github.io/bbb-plugin-themes/kids/<4.0.0|4.0.1|4.0.3>/theme.css`

### Light

An airy, corporate light layout with an indigo accent, like Microsoft Teams and Zoom in light mode.

![Light theme](themes/light/screenshot.jpg)

- White icon bar with dark icons and an indigo marker on the left of the active item.
- Light gray stage, white cards with soft shadows for the presentation and cameras.
- Indigo for active buttons, switches and confirm buttons; crisp 8px corners.
- Inter (Google Fonts).

**Best for:** Companies and formal meetings, rooms with a projector or lots of light.

Manifest: `https://gustavotrott.github.io/bbb-plugin-themes/light/manifest.json`

Stylesheet: `https://gustavotrott.github.io/bbb-plugin-themes/light/<4.0.0|4.0.1|4.0.3>/theme.css`

### Midnight

The whole client in dark mode, like Discord, Zoom and Slack at night.

![Midnight theme](themes/midnight/screenshot.jpg)

- Graphite icon bar, panels, menus, modals and notifications (`shared/dark.css` repaints what the client draws in fixed light colors).
- Calm blue accent, green for speaking, a soft red tile for "muted".
- Made for long evening meetings: no white surface left in the sidebar, menus or settings.
- Inter (Google Fonts).

**Best for:** Evening meetings, people who prefer dark mode.

Manifest: `https://gustavotrott.github.io/bbb-plugin-themes/midnight/manifest.json`

Stylesheet: `https://gustavotrott.github.io/bbb-plugin-themes/midnight/<4.0.0|4.0.1|4.0.3>/theme.css`

### Synthwave

An 80s sunset with a neon grid floor and pink/cyan glow (vaporwave / outrun), for fun meetings and events.

![Synthwave theme](themes/synthwave/screenshot.jpg)

- A synthwave scene behind the stage: sunset sky with stars, striped sun, wireframe mountains, palms and the neon grid (`themes/synthwave/scene.svg`).
- Neon pink and purple icon bar, dark glass panels with cyan edges, glowing cameras and presentation.
- Orbitron for titles, Exo 2 for text (Google Fonts); faint CRT scanlines.
- Built on the same dark panels as Midnight (`shared/dark.css`).

**Best for:** Events, parties, game nights and demos.

Manifest: `https://gustavotrott.github.io/bbb-plugin-themes/synthwave/manifest.json`

Stylesheet: `https://gustavotrott.github.io/bbb-plugin-themes/synthwave/<4.0.0|4.0.1|4.0.3>/theme.css`

### Moodle

The colours, type and shapes of the [Moodle Design System](https://design.moodle.com), so a room opened from a Moodle course looks like part of the course.

![Moodle theme](themes/moodle/screenshot.jpg)

- Icon bar in Moodle blue (`blue.500` #0F6CBF); the active item in `blue.700` with a brand-orange mark on the left.
- Light gray stage (`gray.200`), the presentation and cameras as white cards with the system's small shadow.
- Secondary buttons white with a gray border like Moodle's `btn-secondary`; primary in blue, darker on hover.
- Chat: own messages in `blue.50`, others in `gray.100`.
- Noto Sans, the system's typeface; radius tokens 6/8/12 px; a blue focus ring that is always visible.
- The Moodle Design System primitives are at the top of `themes/moodle/theme.css` as `--mds-*` variables.

**Best for:** Rooms opened from a Moodle course.

Manifest: `https://gustavotrott.github.io/bbb-plugin-themes/moodle/manifest.json`

Stylesheet: `https://gustavotrott.github.io/bbb-plugin-themes/moodle/<4.0.0|4.0.1|4.0.3>/theme.css`

### School (K-12)

Made for K-12 classes: legible and calm, with every tool in its own colour, friendly for young pupils without looking childish to teenagers.

![School (K-12) theme](themes/school/screenshot.jpg)

- Lexend, a typeface designed to make reading easier, slightly larger than the client's default.
- Each tool in the icon bar has its colour (people yellow, chat green, notes pink, polls orange...); the active one becomes a block of that colour.
- Raised hands in a yellow row the teacher can't miss.
- 46px action buttons that press down; a yellow keyboard focus ring.
- A light stage on graph paper, with white cards for the presentation and cameras.

**Best for:** Whole K-12 schools: children, teenagers and teachers on the same platform.

Manifest: `https://gustavotrott.github.io/bbb-plugin-themes/school/manifest.json`

Stylesheet: `https://gustavotrott.github.io/bbb-plugin-themes/school/<4.0.0|4.0.1|4.0.3>/theme.css`

## Build from source

```bash
npm ci
npm run build-bundle                                     # every theme, into dist/<theme>/
npx webpack --mode production --env themes=cozy,school   # only some plugins
npm run build-css                                        # only the stylesheets
node scripts/css.js cozy,school                          # only some stylesheets
```

Each `dist/<theme>/` holds `<Library>.js`, `manifest.json`, `theme.css` and the frozen stylesheets for older versions, copied from `versions/<theme>/`. Copy it to `/var/www/bigbluebutton-default/assets/plugins/bbb-plugin-<theme>-theme/` and follow steps 2 and 3 above.

## Layout

| Path | What it holds |
|---|---|
| `shared/base.css` | Shared base (layout, icons, accessibility), with every colour and corner as a `--theme-*` variable |
| `shared/dark.css` | Dark panels, menus, modals and notifications (Midnight and Synthwave) |
| `shared/icons/` | Lucide icons, inlined into the bundle |
| `shared/plugin.tsx` | Registers the plugin with the client |
| `themes/<theme>/theme.css` | The theme: palette (`:root` variables) and its own look |
| `themes/<theme>/scene.svg` | Background illustration (Cozy, Kids, Synthwave). Replace it with any image and rebuild |
| `themes/<theme>/manifest.json` | Plugin manifest |

To make a new theme, copy a folder in `themes/`, change the library `name` in its `manifest.json`, and set the variables at the top of its `theme.css`.

## Releases

Every push to `main` publishes `dist/` (plugins and stylesheets) on GitHub Pages. Pushing a `v*` tag, with the same version as `package.json` and the manifests, builds the themes and attaches the tarballs to a GitHub release:

- `bbb-plugin-<theme>-theme.tar.gz`, one per theme
- `bbb-plugin-themes.tar.gz`, with all of them

## License

MIT, see [LICENSE](LICENSE). Icons are from [Lucide](https://lucide.dev), ISC license, see [shared/icons/LICENSE](shared/icons/LICENSE).
