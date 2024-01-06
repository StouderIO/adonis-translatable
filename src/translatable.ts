import { BaseModel, column } from '@adonisjs/lucid/orm'

export type Constructor = new (...args: any[]) => any
export type NormalizeConstructor<T extends Constructor> = {
  new (...args: any[]): InstanceType<T>
} & Omit<T, 'constructor'>

export const Translatable = <T extends NormalizeConstructor<typeof BaseModel>>(superclass: T) => {
  class TranslatableClass extends superclass {
    @column()
    declare translatedFields: string[]
  }
  return TranslatableClass
}
