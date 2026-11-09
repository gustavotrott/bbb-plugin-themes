import * as React from 'react';
import {
  BbbPluginSdk,
  IntlLocaleUiDataNames,
  OptionsDropdownOption,
} from 'bigbluebutton-html-plugin-sdk';
import { STRINGS, pickLang } from './i18n';
import { appliedTheme, applyTheme, readChoice, saveChoice } from './apply';
import { isDarkModeOn } from './darkmode';
import { effectiveTheme, readConfig } from './settings';
import { NONE, findTheme } from './themes';
import Picker from './Picker';

export default function Plugin({ uuid }: { uuid: string }): React.ReactElement | null {
  BbbPluginSdk.initialize(uuid);
  const pluginApi = BbbPluginSdk.getPluginApi(uuid);
  const settings = pluginApi.usePluginSettings();
  const intl = pluginApi.useUiData(IntlLocaleUiDataNames.CURRENT_LOCALE, { locale: 'en', fallbackLocale: 'en' });
  const lang = pickLang(intl?.locale, intl?.fallbackLocale);
  const t = STRINGS[lang];

  // Settings that fail to load count as empty, so the built-in defaults apply
  const ready = !settings.loading || !!settings.error;
  const data = settings.error ? undefined : settings.data;
  const config = React.useMemo(() => readConfig(data as Record<string, unknown>), [data]);
  const [choice, setChoice] = React.useState(readChoice);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (config.unknown.length === 0) return;
    const message = `BbbPluginThemes: unknown theme ids in the "themes" setting: ${config.unknown.join(', ')}`;
    if (pluginApi.logger) pluginApi.logger.warn(message);
    else console.warn(message);
  }, [config]);

  // Until the settings are in, the theme from the last visit (applied in index.tsx) stays
  const active = ready ? effectiveTheme(config, choice) : appliedTheme();
  React.useEffect(() => {
    if (ready) applyTheme(active);
  }, [ready, active]);

  const showPicker = ready && config.allowUserChoice;
  React.useEffect(() => {
    pluginApi.setOptionsDropdownItems(showPicker ? [
      new OptionsDropdownOption({
        label: t.menu,
        icon: 'palette',
        dataTest: 'themePicker',
        // The client runs this before it closes its menu: open once the menu
        // and its focus trap are gone, or the two dialogs fight over the focus
        onClick: () => {
          window.setTimeout(() => setOpen(true), 0);
        },
      }),
    ] : []);
  }, [showPicker, t.menu]);
  // No menu entry left behind when this copy of the plugin is unmounted (see index.tsx)
  React.useEffect(() => () => {
    pluginApi.setOptionsDropdownItems([]);
  }, []);

  const pick = (id: string) => {
    saveChoice(id);
    setChoice(id);
    applyTheme(id);
  };

  // The client's dark mode. Turning it on while a light theme is active asks for
  // a dark client: back to 'none', so the dark mode shows. A dark theme stays
  // (and the dark mode stays paused), as does any theme the user may not change.
  const [darkMode, setDarkMode] = React.useState(isDarkModeOn);
  React.useEffect(() => {
    const onChange = (event: Event) => {
      const enabled = !!(event as CustomEvent<{ enabled?: boolean }>).detail?.enabled;
      setDarkMode(enabled);
      const theme = findTheme(appliedTheme());
      if (enabled && ready && config.allowUserChoice && theme && !theme.dark) pick(NONE);
    };
    window.addEventListener('darkmodechange', onChange);
    return () => window.removeEventListener('darkmodechange', onChange);
  }, [ready, config.allowUserChoice]);

  if (!open || !showPicker) return null;
  return (
    <Picker
      themes={config.offered}
      active={active}
      darkMode={darkMode}
      lang={lang}
      t={t}
      onPick={pick}
      onClose={() => setOpen(false)}
    />
  );
}
