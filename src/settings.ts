import { NONE, THEMES, Theme, findTheme, normalizeId } from './themes';

// Plugin settings, from public.plugins in /etc/bigbluebutton/bbb-html5.yml (see manifest.json)
export interface Config {
  defaultTheme: string; // a theme id or 'none'
  offered: Theme[]; // the themes in the picker, besides 'none'
  allowUserChoice: boolean;
  unknown: string[]; // ids in the themes setting that match no theme
}

// "a, b" or a YAML list
function list(value: unknown): string[] {
  const items = Array.isArray(value) ? value : String(value ?? '').split(',');
  return items.map((item) => String(item ?? '').trim()).filter(Boolean);
}

export function readConfig(settings: Record<string, unknown> = {}): Config {
  const defaultTheme = normalizeId(settings.defaultTheme) || NONE;
  const listed = list(settings.themes);
  const unknown = listed.filter((id) => !findTheme(id));
  const known = listed
    .map(findTheme)
    .filter((theme, i, all): theme is Theme => !!theme && all.indexOf(theme) === i);
  // Empty, absent or nothing known (a typo): all themes
  const offered = known.length === 0 ? [...THEMES] : known;
  // The default theme is always in the picker, so the active theme is always listed
  const defaultEntry = findTheme(defaultTheme);
  if (defaultEntry && !offered.includes(defaultEntry)) offered.unshift(defaultEntry);
  const allow = String(settings.allowUserChoice ?? '').trim().toLowerCase();
  return { defaultTheme, offered, allowUserChoice: allow !== 'false', unknown };
}

// The user's choice if allowed and offered ('none' always is), else the default theme
export function effectiveTheme(config: Config, choice: string | undefined): string {
  if (config.allowUserChoice && choice) {
    if (choice === NONE || config.offered.some((theme) => theme.id === choice)) return choice;
  }
  return config.defaultTheme;
}
