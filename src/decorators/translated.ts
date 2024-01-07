import { ColumnOptions, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { Translatable } from '../translatable.js'

export interface TranslatedOptions {}

export type TranslatedDecorator = (
  options?: TranslatedOptions & Partial<ColumnOptions>
) => <TKey extends string, TTarget extends { [K in TKey]: string }>(
  target: TTarget,
  propertyKey: TKey
) => void

export const TRANSLATION_RELATION_NAME = 'translations'

type TranslatableConstructor = ReturnType<ReturnType<typeof Translatable>>

function beforeFindHook(query: ModelQueryBuilderContract<TranslatableConstructor>) {
  query.preload(TRANSLATION_RELATION_NAME as any)
}

function afterFindHook(modelInstance: LucidRow) {
  const constructor = modelInstance.constructor as TranslatableConstructor
  for (const translatedField of constructor.translatedFields) {
    ;(modelInstance as any)[translatedField] = (
      modelInstance.$preloaded[TRANSLATION_RELATION_NAME] as LucidRow[]
    )
      .find((translation: any) => translation.locale === constructor.defaultLocale)!
      .$getAttribute(translatedField)
  }
}

function afterFetchHook(modelInstances: LucidRow[]) {
  for (const modelInstance of modelInstances) {
    afterFindHook(modelInstance)
  }
}

function beforeCreateHook(modelInstance: InstanceType<TranslatableConstructor>) {
  const constructor = modelInstance.constructor as TranslatableConstructor

  // generate default translation
  const translation = new constructor.translationModel()
  translation.$setAttribute('locale', constructor.defaultLocale)

  Object.keys(modelInstance.$attributes).reduce((mustSave, property) => {
    if (constructor.translatedFields.includes(property)) {
      translation.$setAttribute(property, modelInstance.$getAttribute(property))
      delete modelInstance.$dirty[property]
      return true
    }
    return mustSave
  }, false)

  modelInstance.$dirtyTranslations.push(translation)
}

async function afterCreateHook(modelInstance: InstanceType<TranslatableConstructor>) {
  modelInstance.related(TRANSLATION_RELATION_NAME as any).saveMany(modelInstance.$dirtyTranslations)
}

const translated: TranslatedDecorator = () => {
  return function decorateAsColumn(target: any, propertyKey: string) {
    const Model = target.constructor as TranslatableConstructor
    Model.boot()

    if (!Model.translationModel) {
      throw new Error('Translation model is not defined')
    }

    Model.$defineProperty('translatedFields', [], 'inherit')
    Model.translatedFields.push(propertyKey)

    Model.$addColumn(propertyKey, {})

    if (!Model.$hasRelation(TRANSLATION_RELATION_NAME)) {
      Model.$addRelation(TRANSLATION_RELATION_NAME, 'hasMany', () => Model.translationModel, {
        serializeAs: null,
      })
    }

    // read logic
    if (!Model.$hooks.has('beforeFind', beforeFindHook)) {
      Model.before('find', beforeFindHook)
    }
    if (!Model.$hooks.has('beforeFetch', beforeFindHook)) {
      Model.before('fetch', beforeFindHook)
    }
    if (!Model.$hooks.has('afterFind', afterFindHook)) {
      Model.after('find', afterFindHook)
    }
    if (!Model.$hooks.has('afterFetch', afterFindHook)) {
      Model.after('fetch', afterFetchHook)
    }

    // write logic
    if (!Model.$hooks.has('beforeCreate', beforeCreateHook)) {
      Model.before('create', beforeCreateHook)
    }
    if (!Model.$hooks.has('afterCreate', afterCreateHook)) {
      Model.after('create', afterCreateHook)
    }
  }
}

export default translated
