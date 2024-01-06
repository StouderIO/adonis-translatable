import { test } from '@japa/runner'
import { column } from '@adonisjs/lucid/orm'
import { cleanup, getBaseModel, getDb, ormAdapter, setup } from '../test-helpers/index.js'
import { AppFactory } from '@adonisjs/core/factories/app'
import { compose } from '@adonisjs/core/helpers'
import { Translatable } from '../src/translatable.js'

test.group('Translatable', (group) => {
  group.setup(async () => {
    await setup()
  })

  group.teardown(async () => {
    await cleanup()
  })

  test('simple model', async ({ fs, assert }) => {
    const app = new AppFactory().create(fs.baseUrl, () => {})
    await app.init()
    const db = getDb()
    const adapter = ormAdapter(db)

    const BaseModel = getBaseModel(adapter)

    class Post extends compose(BaseModel, Translatable) {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare author: string

      @column()
      declare title: string

      @column()
      declare body: string
    }

    Post.boot()

    const post = new Post()
    post.s
  })
})
