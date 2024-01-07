export default class Translation {
  #map: { [locale: string]: string }

  private constructor(map: { [locale: string]: string }) {
    this.#map = map
  }

  static from(map: { [locale: string]: string }): Translation {
    return new Translation(map)
  }

  get(locale: string): string {
    return this.#map[locale]
  }
}
