export class Language {
  selectedLang = '';

  constructor(
    private staticElements: Element[],
    private staticTranslations: Record<string, string>[],
    private dynamicElements: Element[],
    private dynamicTranslations: Record<string, Record<string, string>>[],
  ) {}

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

  getTranslate<T extends Record<string, Record<string, string>>>(translations: T, keyword: keyof T) {
    return translations[keyword][this.selectedLang];
  }
}
