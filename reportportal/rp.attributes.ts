/**
 * Atrybuty testu w ReportPortalu, wyliczane z nazwy projektu Playwrighta.
 *
 * Po co to w ogóle: atrybut jest jedyną osią, po której da się w panelu odfiltrować przebieg
 * i zbudować na nim widget. Bez nich lista launchów jest płaska i po tygodniu nie da się
 * odpowiedzieć na pytanie „czy ciemny motyw sypie się częściej niż jasny".
 *
 * Mapa jest zamrożona celowo. Gdyby atrybuty wyliczały się z `testInfo.project.use`, to
 * zmiana rozdzielczości w `playwright.config.ts` po cichu rozjechałaby historię w panelu:
 * stare przebiegi zostałyby z jedną wartością, nowe dostałyby inną, a widget pokazałby
 * dwie serie zamiast jednej. Zmiana tej mapy ma być świadomą decyzją, jak zmiana baseline'u.
 */

export interface RpAttribute {
  key: string;
  value: string;
}

const BY_PROJECT: Record<string, RpAttribute[]> = {
  'rp-desktop-light': [
    { key: 'viewport', value: '1920x1080' },
    { key: 'colorScheme', value: 'light' },
    { key: 'device', value: 'desktop' },
  ],
  'rp-mobile-light': [
    { key: 'viewport', value: '390x844' },
    { key: 'colorScheme', value: 'light' },
    { key: 'device', value: 'mobile' },
  ],
  'rp-desktop-dark': [
    { key: 'viewport', value: '1920x1080' },
    { key: 'colorScheme', value: 'dark' },
    { key: 'device', value: 'desktop' },
  ],
};

/**
 * Atrybuty dla projektu. Nieznany projekt nie jest błędem: dostaje jeden atrybut
 * diagnostyczny, żeby w panelu było widać, że mapa się rozjechała z konfiguracją.
 */
export function attributesForProject(projectName: string): RpAttribute[] {
  return BY_PROJECT[projectName] ?? [{ key: 'project', value: projectName }];
}

export const KNOWN_PROJECTS = Object.keys(BY_PROJECT);
