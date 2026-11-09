// BigBlueButton's dark mode is DarkReader in dynamic mode. It restyles the page
// with <style class="darkreader ..."> elements: its own rules (with the
// client's dark palette), a dark copy of every stylesheet and the overrides
// for inline styles. While a theme is active they are switched off, and so is
// every new one DarkReader adds; with 'none' they come back. The client's own
// dark mode setting is not touched. Our sheets carry the class "stylus", which
// DarkReader leaves alone (it skips the Stylus extension's styles).
//
// The wanted state lives on <html>, not in a variable, so that a second copy
// of the plugin (see index.tsx) and this one agree.
const STATE_ATTR = 'data-bbb-plugin-themes-darkreader';
const PAUSED_ATTR = 'data-bbb-plugin-themes-paused'; // on the DarkReader styles we switched off
const DARKREADER_STYLE = 'style.darkreader';

const isDarkReaderStyle = (node: Node): node is Element => (node as Element).localName === 'style'
  && (node as Element).classList.contains('darkreader');

export const isDarkModeOn = (): boolean => document.documentElement.hasAttribute('data-darkreader-mode');

function switchOff(style: Element): void {
  const { sheet } = style as HTMLStyleElement;
  if (sheet) sheet.disabled = true;
  style.setAttribute(PAUSED_ATTR, '');
}

// New DarkReader styles, and rewritten ones (new content means a new, enabled
// sheet). The client changes the page a lot, so the checks stay cheap.
const watcher = new MutationObserver((records) => {
  const found: Element[] = [];
  records.forEach(({ target, addedNodes }) => {
    if (isDarkReaderStyle(target)) found.push(target);
    addedNodes.forEach((node) => {
      if (isDarkReaderStyle(node)) found.push(node);
      else if ((node as Element).classList?.contains('darkreader')) {
        found.push(...Array.from((node as Element).querySelectorAll(DARKREADER_STYLE)));
      }
    });
  });
  if (found.length === 0) return;
  if (!document.documentElement.hasAttribute(STATE_ATTR)) {
    watcher.disconnect(); // another copy of the plugin resumed dark mode
    return;
  }
  found.forEach(switchOff);
});

export function pauseDarkMode(paused: boolean): void {
  const html = document.documentElement;
  if (paused) {
    html.setAttribute(STATE_ATTR, 'paused');
    document.querySelectorAll(DARKREADER_STYLE).forEach(switchOff);
    watcher.observe(document, { childList: true, subtree: true });
    return;
  }
  watcher.disconnect();
  if (!html.hasAttribute(STATE_ATTR)) return;
  html.removeAttribute(STATE_ATTR);
  document.querySelectorAll(`[${PAUSED_ATTR}]`).forEach((style) => {
    const { sheet } = style as HTMLStyleElement;
    if (sheet) sheet.disabled = false;
    style.removeAttribute(PAUSED_ATTR);
  });
}
