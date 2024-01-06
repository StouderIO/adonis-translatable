import { LucidModel } from '@adonisjs/lucid/types/model'

const translated = () => {
  return function decorateAsColumn(target: any, propertyKey: string) {
    const Model = target.constructor as LucidModel
    Model.boot()

    Model.$defineProperty('translatedFields', [], 'inherit')
  }
}

export default translated
