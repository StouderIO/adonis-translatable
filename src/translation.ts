type TranslationAttributes = Record<string, string>

export default class Translation {
  readonly #values: Record<string, string> = {}

  static fromDbResponse(response: any): Translation | null {
    if (response === null) {
      return null
    }

    const attributes: TranslationAttributes =
      typeof response === 'string' ? JSON.parse(response) : response

    return new Translation(attributes)
  }

  static from(values: TranslationAttributes): Translation {
    return new Translation(values)
  }

  private constructor(values: TranslationAttributes) {
    this.#values = values
  }

  get(locale: string): string | undefined {
    return this.#values[locale]
  }

  getOrFail(locale: string): string {
    const value = this.get(locale)
    if (value === undefined) {
      throw new Error(`No translation found for locale "${locale}"`)
    }
    return value
  }

  set(locale: string, value: string) {
    this.#values[locale] = value
  }

  toObject() {
    return this.#values
  }
}
