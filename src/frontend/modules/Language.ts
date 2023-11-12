import { gameTranslations, preparationTranslations, statusTranslations } from './translations';

export class Language {
  selectedLang = '';
  private staticElements: Element[];
  private staticTranslations: Record<string, string>[];
  private dynamicElements: Element[];
  private dynamicTranslations: Record<string, Record<string, string>>[];

  constructor() {
    const preparationActions = Array.from(
      document.querySelector('[data-scene="preparation"]')!.querySelectorAll('.app-action')!,
    );
    const computerActions = Array.from(
      document.querySelector('[data-scene="computer"]')!.querySelectorAll('.app-action'),
    )!;
    const onlineActions = Array.from(document.querySelector('[data-scene="online"]')!.querySelectorAll('.app-action'))!;

    this.staticElements = [...preparationActions, ...computerActions, ...onlineActions];
    this.staticTranslations = [...preparationTranslations, ...gameTranslations, ...gameTranslations];

    const computerStatus = document.querySelector('[data-scene="computer"]')!.querySelector('.battlefield-status')!;
    const onlineStatus = document.querySelector('[data-scene="online"]')!.querySelector('.battlefield-status')!;

    this.dynamicElements = [computerStatus, onlineStatus];
    this.dynamicTranslations = [statusTranslations, statusTranslations];
  }

  changeLanguage(lang: string) {
    this.selectedLang = lang;

    const { staticElements, staticTranslations, dynamicElements, dynamicTranslations } = this;
    staticElements.forEach((element, index) => {
      element.textContent = staticTranslations[index][lang];
    });

    dynamicElements.forEach((element, index) => {
      const text = element.textContent!;
      const translations = dynamicTranslations[index];
      loop: for (const translation in translations) {
        for (const language in translations[translation]) {
          if (translations[translation][language] === text) {
            element.textContent = translations[translation][lang];
            break loop;
          }
        }
      }
    });
  }

  getTranslate<T extends Record<string, Record<string, string>>>(translations: T, key: keyof T) {
    return translations[key][this.selectedLang];
  }
}
