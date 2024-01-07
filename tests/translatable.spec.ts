import { test } from '@japa/runner'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { createApp, createDatabase, createTables } from '../test-helpers/index.js'
import { compose } from '@adonisjs/core/helpers'
import { Translatable } from '../src/translatable.js'
import translated from '../src/decorators/translated.js'

test.group('Translatable', () => {
  test('find and fetch simple model', async ({ fs, assert }) => {
    const app = await createApp(fs.basePath)
    const db = await createDatabase(app)
    await createTables(db)

    class PostTranslation extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare locale: string

      @column()
      declare title: string

      @column()
      declare body: string
    }

    class Post extends compose(BaseModel, Translatable(PostTranslation)) {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare author: string

      @translated()
      declare title: string

      @translated()
      declare body: string
    }

    const post = await Post.findOrFail(1)
    assert.equal(post.title, 'Hello, world')

    const posts = await Post.all()
    assert.equal(posts.length, 2)
    assert.equal(posts[0].title, 'Foo')
    assert.equal(posts[1].title, 'Hello, world')
  })

  test('find and fetch simple model - with default locale', async ({ fs, assert }) => {
    const app = await createApp(fs.basePath)
    const db = await createDatabase(app)
    await createTables(db)

    class PostTranslation extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare locale: string

      @column()
      declare title: string

      @column()
      declare body: string
    }

    class Post extends compose(BaseModel, Translatable(PostTranslation)) {
      static defaultLocale = 'fr'

      @column({ isPrimary: true })
      declare id: number

      @column()
      declare author: string

      @translated()
      declare title: string

      @translated()
      declare body: string
    }

    const post = await Post.findOrFail(1)
    assert.equal(post.title, 'Bonjour, monde')

    const posts = await Post.all()
    assert.equal(posts.length, 2)
    assert.equal(posts[0].title, 'Bar')
    assert.equal(posts[1].title, 'Bonjour, monde')
  })

  test('find and fetch simple model - translated method', async ({ fs, assert }) => {
    const app = await createApp(fs.basePath)
    const db = await createDatabase(app)
    await createTables(db)

    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'Hello, world',
    })
    await fs.createJson('resources/lang/fr/messages.json', {
      greeting: 'Bonjour, monde',
    })

    class PostTranslation extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare locale: string

      @column()
      declare title: string

      @column()
      declare body: string
    }

    class Post extends compose(BaseModel, Translatable(PostTranslation)) {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare author: string

      @translated()
      declare title: string

      @translated()
      declare body: string
    }

    const post = await Post.findOrFail(1)
    assert.equal(post.translated('fr').title, 'Bonjour, monde')
    assert.equal(post.translated('en').title, 'Hello, world')
  })

  test('insert model', async ({ fs, assert }) => {
    const app = await createApp(fs.basePath)
    const db = await createDatabase(app)
    await createTables(db)

    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'Hello, world',
    })
    await fs.createJson('resources/lang/fr/messages.json', {
      greeting: 'Bonjour, monde',
    })

    class PostTranslation extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare locale: string

      @column()
      declare title: string

      @column()
      declare body: string
    }

    class Post extends compose(BaseModel, Translatable(PostTranslation)) {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare author: string

      @translated()
      declare title: string

      @translated()
      declare body: string
    }

    const post = new Post()
    post.author = 'John Doe'
    post.title = 'A newlycreated post'
    post.body = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    await post.save()

    const translations = await PostTranslation.query().where('post_id', post.id)
    assert.equal(translations.length, 1)
  })

  test('insert model - using translated', async ({ fs, assert }) => {
    const app = await createApp(fs.basePath)
    const db = await createDatabase(app)
    await createTables(db)

    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'Hello, world',
    })
    await fs.createJson('resources/lang/fr/messages.json', {
      greeting: 'Bonjour, monde',
    })

    class PostTranslation extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare locale: string

      @column()
      declare title: string

      @column()
      declare body: string
    }

    class Post extends compose(BaseModel, Translatable(PostTranslation)) {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare author: string

      @translated()
      declare title: string

      @translated()
      declare body: string
    }

    const post = new Post()
    post.author = 'John Doe'
    post.title = 'A newly created post'
    post.body = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    post.translated('fr').title = 'Un nouveau post'
    post.translated('fr').body = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    await post.save()

    const translations = await PostTranslation.query().where('post_id', post.id)
    assert.equal(translations.length, 2)
  })
})
