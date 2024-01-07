<div align="center">
  <img src="https://user-images.githubusercontent.com/2575182/236930626-40d7d2a8-2ded-4f72-a9e8-d8f4ce43ec79.png" />
  <h3>@stouder-io/adonis-translatable</h3>
  <p>AdonisJS package to handle translations for your models.</p>
  <a href="https://www.npmjs.com/package/@stouder-io/adonis-translatable">
    <img src="https://img.shields.io/npm/v/@stouder-io/adonis-translatable.svg?style=for-the-badge&logo=npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@stouder-io/adonis-translatable?color=blueviolet&style=for-the-badge" />
  <img alt="npm" src="https://img.shields.io/npm/dt/@stouder-io/adonis-translatable?style=for-the-badge">
</div>

## Installation
This package is available in the npm registry.
```
pnpm i @stouder-io/adonis-translatable
```

## Usage
After installing the package, you can now decorate your translatable fields with the `@translation` decorator.
```ts
class Post extends BaseModel {
  @column()
  declare id: number

  @translation()
  declare title: Translation

  @translation()
  declare body: Translation
}
```

In your migrations, the translatable fields must be of type `json`.
```ts
export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.json('title')
      table.json('body')
    })
  }
  
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

When using your model, you can now access the translated fields.
```ts
const post = await Post.find(1)
post.title.get('fr')
```

You can access it and throw if it doesn't exist.
```ts
const post = await Post.find(1)
post.title.getOrFail('fr')
```

You can also set the translated fields.
```ts
const post = await Post.find(1)
post.title.set('fr', 'Mon titre')
```

Or fully replace the translations.
```ts
const post = await Post.find(1)
post.title = Translation.from({
  fr: 'Mon titre',
  en: 'My title',
})
```

