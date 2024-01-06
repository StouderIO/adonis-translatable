import { fileURLToPath } from 'node:url'
import { AppFactory } from '@adonisjs/core/factories/app'
import { Logger } from '@adonisjs/core/logger'
import { Emitter } from '@adonisjs/core/events'
import { join } from 'node:path'
import { ConnectionConfig, DatabaseConfig } from '@adonisjs/lucid/types/database'
import { knex } from 'knex'
import { Database } from '@adonisjs/lucid/database'
import { getActiveTest } from '@japa/runner'
// @ts-expect-error
import { Adapter } from '@adonisjs/lucid/build/src/orm/adapter/index.js'
import { AdapterContract } from '@adonisjs/lucid/types/model'
import { BaseModel } from '@adonisjs/lucid/orm'

export const APP_ROOT = new URL('./tmp', import.meta.url)
export const SQLITE_BASE_PATH = fileURLToPath(APP_ROOT)

const app = new AppFactory().create(APP_ROOT, () => {})
export const emitter = new Emitter<any>(app)
export const logger = new Logger({})
export const createEmitter = () => new Emitter<any>(app)

export function getConfig(): ConnectionConfig {
  return {
    client: 'better-sqlite3',
    connection: {
      filename: join(SQLITE_BASE_PATH, 'better-sqlite-db.sqlite'),
    },
    useNullAsDefault: true,
    debug: !!process.env.DEBUG,
    pool: {
      afterCreate(connection, done) {
        connection.unsafeMode(true)
        done()
      },
    },
  }
}

export async function setup(destroyDb: boolean = true) {
  const db = knex(Object.assign({}, getConfig(), { debug: false }))

  const hasPostTable = await db.schema.hasTable('posts')
  if (!hasPostTable) {
    await db.schema.createTable('posts', (table) => {
      table.increments('id')
      table.string('author').notNullable()
      table.timestamps(true)
    })
  }

  const hasPostTranslationTable = await db.schema.hasTable('post_translations')
  if (!hasPostTranslationTable) {
    await db.schema.createTable('posts', (table) => {
      table.increments('id')
      table.integer('post_id').unsigned().references('id').inTable('posts').onDelete('CASCADE')
      table.string('locale').notNullable()
      table.string('title').notNullable()
      table.string('body').notNullable()
      table.timestamps(true)
    })
  }

  if (destroyDb) {
    await db.destroy()
  }
}

export async function cleanup(customTables: string[] = []) {
  const db = knex(Object.assign({}, getConfig(), { debug: false }))

  for (const table of customTables) {
    await db.schema.dropTableIfExists(table)
  }
  await db.schema.dropTableIfExists('posts')
  await db.schema.dropTableIfExists('post_translations')

  await db.destroy()
}

export function getDb(eventEmitter?: Emitter<any>, config?: DatabaseConfig) {
  const defaultConfig = {
    connection: 'primary',
    connections: {
      primary: getConfig(),
      secondary: getConfig(),
    },
  }

  const db = new Database(config || defaultConfig, logger, eventEmitter || createEmitter())
  const test = getActiveTest()
  test?.cleanup(() => {
    return db.manager.closeAll()
  })

  return db
}

export function ormAdapter(db: Database) {
  return new Adapter(db)
}

export function getBaseModel(adapter: AdapterContract) {
  BaseModel.$adapter = adapter
  return BaseModel
}
