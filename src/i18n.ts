// UI strings. Theme names are not translated; descriptions come from each theme.json.
export type Lang = 'en' | 'de' | 'es' | 'fr' | 'pt-BR';

export interface Strings {
  menu: string;
  title: string;
  intro: string;
  legend: string;
  defaultName: string;
  defaultDescription: string;
  close: string;
  darkModePaused: string;
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    menu: 'Theme',
    title: 'Theme',
    intro: 'The look changes right away and is saved in this browser.',
    legend: 'Available themes',
    defaultName: 'BigBlueButton default',
    defaultDescription: 'The standard look, without a theme.',
    close: 'Close',
    darkModePaused: "BigBlueButton's dark mode is paused while a theme is active.",
  },
  de: {
    menu: 'Design',
    title: 'Design',
    intro: 'Das Aussehen ändert sich sofort und bleibt in diesem Browser gespeichert.',
    legend: 'Verfügbare Designs',
    defaultName: 'BigBlueButton-Standard',
    defaultDescription: 'Das normale Aussehen, ohne Design.',
    close: 'Schließen',
    darkModePaused: 'Der Dark-Mode von BigBlueButton ist pausiert, solange ein Design aktiv ist.',
  },
  es: {
    menu: 'Tema',
    title: 'Tema',
    intro: 'El aspecto cambia al instante y se guarda en este navegador.',
    legend: 'Temas disponibles',
    defaultName: 'BigBlueButton predeterminado',
    defaultDescription: 'El aspecto estándar, sin tema.',
    close: 'Cerrar',
    darkModePaused: 'El modo oscuro de BigBlueButton está en pausa mientras haya un tema activo.',
  },
  fr: {
    menu: 'Thème',
    title: 'Thème',
    intro: "L'apparence change tout de suite et reste enregistrée dans ce navigateur.",
    legend: 'Thèmes disponibles',
    defaultName: 'BigBlueButton par défaut',
    defaultDescription: "L'apparence standard, sans thème.",
    close: 'Fermer',
    darkModePaused: "Le mode sombre de BigBlueButton est en pause tant qu'un thème est actif.",
  },
  'pt-BR': {
    menu: 'Tema',
    title: 'Tema',
    intro: 'A aparência muda na hora e fica salva neste navegador.',
    legend: 'Temas disponíveis',
    defaultName: 'Padrão do BigBlueButton',
    defaultDescription: 'A aparência padrão, sem tema.',
    close: 'Fechar',
    darkModePaused: 'O modo escuro do BigBlueButton fica pausado enquanto um tema estiver ativo.',
  },
};

// de-AT -> de, pt_BR / pt-BR / pt -> pt-BR, anything else -> undefined
function match(locale: string | undefined): Lang | undefined {
  const tag = (locale || '').trim().replace(/_/g, '-').toLowerCase();
  const primary = tag.split('-')[0];
  if (primary === 'pt') return 'pt-BR';
  return (['en', 'de', 'es', 'fr'] as Lang[]).find((lang) => lang === primary);
}

export function pickLang(locale?: string, fallbackLocale?: string): Lang {
  return match(locale) || match(fallbackLocale) || 'en';
}
