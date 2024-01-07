import { ColumnOptions } from '@adonisjs/lucid/types/model'
import Translation from './translation.js'
import { BaseModel } from '@adonisjs/lucid/orm'

export interface TranslatedOptions {}

export type TranslatedDecorator = (
  options?: TranslatedOptions & Partial<ColumnOptions>
) => <TKey extends string, TTarget extends { [K in TKey]: Translation }>(
  target: TTarget,
  propertyKey: TKey
) => void

const decorator: TranslatedDecorator = (options) => {
  return function decorateAsColumn(target: any, property: string) {
    const Model = target.constructor as typeof BaseModel
    Model.boot()

    const { ...columnOptions } = options ?? {}

    Model.$addColumn(property, {
      consume: (value) => (value ? Translation.fromDbResponse(value) : null),
      prepare: (value) => (value ? JSON.stringify(value.toObject()) : null),
      serialize: (value) => (value ? value.toObject() : null),
      ...columnOptions,
    })
  }
}

export default decorator
