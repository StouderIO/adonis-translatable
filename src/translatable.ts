import { BaseModel, column } from '@adonisjs/lucid/orm'
import { LucidRow } from '@adonisjs/lucid/types/model'
import { TRANSLATION_RELATION_NAME } from './decorators/translated.js'

export type Constructor = new (...args: any[]) => any
export type NormalizeConstructor<T extends Constructor> = {
  new (...args: any[]): InstanceType<T>
} & Omit<T, 'constructor'>

export const Translatable =
  <T extends typeof BaseModel>(TranslationModel: T) =>
  <SuperclassType extends NormalizeConstructor<typeof BaseModel>>(superclass: SuperclassType) => {
    class TranslatableClass extends superclass {
      static translationModel: T = TranslationModel
      static translatedFields: string[]
      static defaultLocale = 'en'
      $dirtyTranslations: InstanceType<T>[] = []

      @column()
      declare locale: string

      translated(locale: string): InstanceType<T> {
        const preloaded = this.$preloaded[TRANSLATION_RELATION_NAME] as LucidRow[]
        if (!preloaded) {
          this.$preloaded[TRANSLATION_RELATION_NAME] = []
        }

        let foundTranslation = (this.$preloaded[TRANSLATION_RELATION_NAME] as LucidRow[]).find(
          (translation: any) => translation.locale === locale
        )

        if (!foundTranslation) {
          foundTranslation = new TranslatableClass.translationModel()
          foundTranslation.$setAttribute('locale', locale)
          ;(this.$preloaded[TRANSLATION_RELATION_NAME] as LucidRow[]).push(foundTranslation)
        }

        return foundTranslation as unknown as InstanceType<T>
      }
    }
    return TranslatableClass
  }
