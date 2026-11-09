import * as React from 'react';
import { createPortal } from 'react-dom';
import { Lang, Strings } from './i18n';
import { NONE, NONE_COLORS, THEMES, Theme } from './themes';

interface PickerProps {
  themes: Theme[]; // offered themes, 'none' comes first on its own
  active: string;
  darkMode: boolean; // the client's dark mode is on (paused while a theme is active)
  lang: Lang;
  t: Strings;
  onPick: (id: string) => void;
  onClose: () => void;
}

interface Option {
  id: string;
  name: string;
  description: string;
}

// The swatch colors as rules for the picker sheet, not inline styles: the
// client's dark mode (DarkReader) rewrites inline colors, and leaves that sheet alone
export function swatchCss(): string {
  return [{ id: NONE, colors: NONE_COLORS }, ...THEMES]
    .filter(({ id }) => /^[\w-]+$/.test(id))
    .map(({ id, colors }) => {
      const vars = Object.entries(colors)
        .filter(([, color]) => /^#[0-9a-f]{3,8}$/i.test(color))
        .map(([name, color]) => `--bbbtp-swatch-${name}: ${color};`);
      return `.bbbtp-swatch[data-swatch="${id}"] { ${vars.join(' ')} }`;
    })
    .join('\n');
}

// A tiny drawing of the client in the theme's colors: icon bar, stage, panel, a button
function Swatch({ id }: { id: string }): React.ReactElement {
  return (
    <span className="bbbtp-swatch" data-swatch={id} aria-hidden="true">
      <span className="bbbtp-swatch-nav" />
      <span className="bbbtp-swatch-button" />
      <span className="bbbtp-swatch-panel">
        <span />
        <span />
      </span>
    </span>
  );
}

// Tab stops in the dialog: buttons and the checked radio (a radio group is one stop)
function tabStops(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('button, input[type="radio"]:checked'));
}

// Back to where the user was. The menu item that opened the dialog is usually gone
// (or hidden) by then: focus then goes to the options button that opened the menu.
function restoreFocus(opener: Element | null): void {
  if (opener instanceof HTMLElement && opener !== document.body) opener.focus();
  if (opener !== document.body && document.activeElement === opener) return;
  document.querySelector<HTMLElement>('button.bbb-options-button, .bbb-options-button button, [data-test="optionsButton"]')?.focus();
}

export default function Picker({ themes, active, darkMode, lang, t, onPick, onClose }: PickerProps): React.ReactElement {
  const dialog = React.useRef<HTMLDivElement>(null);
  const options: Option[] = [
    { id: NONE, name: t.defaultName, description: t.defaultDescription },
    ...themes.map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description[lang] || theme.description.en || '',
    })),
  ];
  // The dialog follows the active theme; with none, the client's look (dark mode or not, see picker.css)
  const theme = themes.find(({ id }) => id === active);
  const scheme = theme ? (theme.dark ? 'dark' : 'light') : 'none';

  // The dialog's own layer at the end of <body>. React listens for the dialog's
  // events there (portal container), and keys typed in the dialog stop there, so
  // the client's shortcuts (push-to-talk, slide keys...) don't fire behind it.
  const [layer] = React.useState(() => {
    const div = document.createElement('div');
    ['keydown', 'keyup', 'keypress'].forEach((type) => div.addEventListener(type, (event) => event.stopPropagation()));
    return div;
  });
  React.useLayoutEffect(() => {
    document.body.appendChild(layer);
    return () => layer.remove();
  }, []);

  // Focus moves into the dialog, stays there while it is open, and goes back on close
  React.useEffect(() => {
    const opener = document.activeElement;
    const node = dialog.current;
    const focusStart = () => (node.querySelector<HTMLElement>('input:checked') || tabStops(node)[0])?.focus();
    // Focusing fires focusin again; if another focus trap answers, don't loop with it
    let trapping = false;
    const keepFocus = (event: FocusEvent) => {
      if (trapping || node.contains(event.target as Node)) return;
      trapping = true;
      try {
        focusStart();
      } finally {
        trapping = false;
      }
    };
    focusStart();
    document.addEventListener('focusin', keepFocus);
    return () => {
      document.removeEventListener('focusin', keepFocus);
      restoreFocus(opener);
    };
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    } else if (event.key === 'Tab') {
      // Wrap around at both ends; from the dialog itself (after a click on its text), start over
      const stops = tabStops(dialog.current);
      const at = stops.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey ? at <= 0 : at === -1 || at === stops.length - 1) {
        event.preventDefault();
        (event.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
      }
    }
  };

  return createPortal(
    <div
      className="bbbtp-overlay"
      // A click on the backdrop keeps the focus in the dialog instead of moving it to <body>
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) event.preventDefault();
      }}
    >
      <div
        ref={dialog}
        className="bbbtp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bbbtp-title"
        aria-describedby="bbbtp-intro bbbtp-note"
        lang={lang}
        dir="ltr"
        data-scheme={scheme}
        // Clicks on its text or padding focus the dialog itself, so Escape keeps working
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="bbbtp-header">
          <h2 id="bbbtp-title" className="bbbtp-title">{t.title}</h2>
          <button type="button" className="bbbtp-close" aria-label={t.close} title={t.close} onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <p id="bbbtp-intro" className="bbbtp-intro">{t.intro}</p>
        <p id="bbbtp-note" className="bbbtp-note" role="status">{darkMode && theme ? t.darkModePaused : ''}</p>
        <fieldset className="bbbtp-fieldset">
          <legend className="bbbtp-sr-only">{t.legend}</legend>
          <div className="bbbtp-options">
            {options.map((option) => (
              <label key={option.id} className="bbbtp-option">
                <input
                  type="radio"
                  name="bbbtp-theme"
                  value={option.id}
                  checked={option.id === active}
                  onChange={() => onPick(option.id)}
                  aria-labelledby={`bbbtp-name-${option.id}`}
                  aria-describedby={`bbbtp-desc-${option.id}`}
                />
                <Swatch id={option.id} />
                <span className="bbbtp-text">
                  <span id={`bbbtp-name-${option.id}`} className="bbbtp-name">{option.name}</span>
                  <span id={`bbbtp-desc-${option.id}`} className="bbbtp-desc">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>,
    layer,
  );
}
