import { Emitter } from '@adonisjs/core/events'
import { LoggerFactory } from '@adonisjs/core/factories/logger'
import { Database } from '@adonisjs/lucid/database'
import { BaseModel } from '@adonisjs/lucid/orm'
import { getActiveTest } from '@japa/runner'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { ApplicationService } from '@adonisjs/core/types'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { defineConfig, formatters, loaders } from '@adonisjs/i18n'

const BASE_URL = new URL('./tmp/', import.meta.url)
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, BASE_URL).href)
  }
  return import(filePath)
}

export async function createApp(baseUrl: string) {
  const ignitor = new IgnitorFactory()
    .withCoreConfig()
    .withCoreProviders()
    .merge({
      config: {
        i18n: defineConfig({
          formatter: formatters.icu(),
          loaders: [
            loaders.fs({
              location: baseUrl,
            }),
          ],
        }),
      },
      rcFileContents: {
        providers: [() => import('@adonisjs/i18n/i18n_provider')],
      },
    })
    .create(BASE_URL, {
      importer: IMPORTER,
    })

  const app = ignitor.createApp('web')
  await app.init()
  await app.boot()
  return app
}

export async function createDatabase(app: ApplicationService) {
  const test = getActiveTest()
  if (!test) {
    throw new Error('Cannot use "createDatabase" outside of a Japa test')
  }

  await mkdir(test.context.fs.basePath)

  const logger = new LoggerFactory().create()
  const emitter = new Emitter(app)
  const db = new Database(
    {
      connection: 'primary',
      connections: {
        primary: {
          client: 'sqlite3',
          connection: {
            filename: join(test.context.fs.basePath, 'db.sqlite3'),
          },
        },
      },
    },
    logger,
    emitter
  )

  test.cleanup(() => db.manager.closeAll())
  BaseModel.useAdapter(db.modelAdapter())
  return db
}

export async function createTables(db: Database) {
  const test = getActiveTest()
  if (!test) {
    throw new Error('Cannot use "createTables" outside of a Japa test')
  }

  test.cleanup(async () => {
    await db.connection().schema.dropTable('posts')
    await db.connection().schema.dropTable('post_translations')
  })
  await db.connection().schema.createTable('posts', (table) => {
    table.increments('id')
    table.string('author').notNullable()
    table.timestamps(true)
  })
  await db.connection().table('posts').insert({ author: 'John Doe' })
  await db.connection().table('posts').insert({ author: 'Jane Doe' })

  await db.connection().schema.createTable('post_translations', (table) => {
    table.increments('id')
    table.integer('post_id').unsigned().references('id').inTable('posts').onDelete('CASCADE')
    table.string('locale').notNullable()
    table.string('title').notNullable()
    table.string('body').notNullable()
    table.timestamps(true)
  })
  await db.connection().table('post_translations').insert({
    post_id: 1,
    locale: 'en',
    title: 'Hello, world',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  await db.connection().table('post_translations').insert({
    post_id: 1,
    locale: 'fr',
    title: 'Bonjour, monde',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  await db.connection().table('post_translations').insert({
    post_id: 2,
    locale: 'en',
    title: 'Foo',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  await db.connection().table('post_translations').insert({
    post_id: 2,
    locale: 'fr',
    title: 'Bar',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
}
