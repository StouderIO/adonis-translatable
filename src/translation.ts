interface TranslationAttributes {
  [key: string]: string
}

export default class Translation {
  #values: Map<string, string> = new Map()

  static fromDbResponse(response: any) {
    if (response === null) {
      return null
    }

    const attributes: TranslationAttributes =
      typeof response === 'string' ? JSON.parse(response) : response

    return new Translation(attributes)
  }

  static from(values: TranslationAttributes) {
    return new Translation(values)
  }

  private constructor(values: TranslationAttributes) {
    Object.entries(values).forEach(([key, value]) => {
      this.#values.set(key, value)
    })
  }

  get(locale: string) {
    return this.#values.get(locale)
  }

  getOrFail(locale: string) {
    const value = this.get(locale)
    if (value === undefined) {
      throw new Error(`No translation found for locale "${locale}"`)
    }
    return value
  }

  set(locale: string, value: string) {
    this.#values.set(locale, value)
  }

  toObject() {
    return Object.fromEntries(this.#values)
  }
}
