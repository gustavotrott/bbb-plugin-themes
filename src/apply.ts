import { NONE, findTheme, normalizeId } from './themes';
import { pauseDarkMode } from './darkmode';

// Only theme ids are stored, in this browser, for every meeting on this server
const CHOICE_KEY = 'bbb-plugin-themes:choice'; // what the user picked
const APPLIED_KEY = 'bbb-plugin-themes:applied'; // what was applied last, to restore it before the settings load

// Theme sheets carry data-bbb-plugin-themes="<theme id>"; the picker sheet data-bbb-plugin-themes-picker
const THEME_ATTR = 'data-bbb-plugin-themes';
const PICKER_ATTR = 'data-bbb-plugin-themes-picker';

function load(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null; // storage disabled or blocked
  }
}

function save(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    // storage disabled, blocked or full: the theme still applies for this visit
  }
}

export const readChoice = (): string | undefined => normalizeId(load(CHOICE_KEY));
export const saveChoice = (id: string): void => save(CHOICE_KEY, id);
export const readApplied = (): string => normalizeId(load(APPLIED_KEY)) || NONE;

// Each sheet is its own <style> at the end of <head>, where style-loader used to
// put them. The class "stylus" keeps DarkReader (the client's dark mode) from
// rewriting them, see darkmode.ts.
function addStyle(css: string, attr: string, value = ''): void {
  const style = document.createElement('style');
  style.className = 'stylus';
  style.setAttribute(attr, value);
  style.textContent = css;
  document.head.appendChild(style);
}

export function injectPickerStyles(css: string): void {
  if (!document.querySelector(`style[${PICKER_ATTR}]`)) addStyle(css, PICKER_ATTR);
}

const themeStyles = () => document.querySelectorAll(`style[${THEME_ATTR}]`);

// Read from the page, not kept in a variable: the client may load the plugin a
// second time (BigBlueButton 4.0 does on some layout switches), and both copies
// must see the same state
export const appliedTheme = (): string => themeStyles()[0]?.getAttribute(THEME_ATTR) || NONE;

// Swaps the theme stylesheets; 'none' (or an unknown id) removes them all.
// The client's dark mode pauses while a theme is active.
export function applyTheme(id: string): void {
  const theme = findTheme(id);
  const next = theme ? theme.id : NONE;
  const styles = themeStyles();
  if (next !== appliedTheme() || styles.length !== (theme ? theme.sheets.length : 0)) {
    styles.forEach((style) => style.remove());
    theme?.sheets.forEach((css) => addStyle(css, THEME_ATTR, theme.id));
    save(APPLIED_KEY, next);
  }
  pauseDarkMode(!!theme);
}
