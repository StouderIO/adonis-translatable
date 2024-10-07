import { test } from '@japa/runner'
import Translation from '../src/translation.js'

test.group('Translation', () => {
  test('fromDbResponse', async ({ assert }) => {
    const entry = Translation.fromDbResponse({
      en: 'Hello, world',
      fr: 'Bonjour, monde',
    })
    assert.isNotNull(entry)
    assert.isTrue(entry instanceof Translation)

    const entry2 = Translation.fromDbResponse(null)
    assert.isNull(entry2)
  })

  test('from', async ({ assert }) => {
    const entry = Translation.from({
      en: 'Hello, world',
      fr: 'Bonjour, monde',
    })
    assert.isNotNull(entry)
    assert.isTrue(entry instanceof Translation)
  })

  test('get', async ({ assert }) => {
    const entry = Translation.fromDbResponse({
      en: 'Hello, world',
      fr: 'Bonjour, monde',
    })!
    assert.equal(entry.get('en'), 'Hello, world')
    assert.equal(entry.get('fr'), 'Bonjour, monde')
    assert.isUndefined(entry.get('es'))
  })

  test('getOrFail', async ({ assert }) => {
    const entry = Translation.fromDbResponse({
      en: 'Hello, world',
      fr: 'Bonjour, monde',
    })!
    assert.equal(entry.getOrFail('en'), 'Hello, world')
    assert.equal(entry.getOrFail('fr'), 'Bonjour, monde')
    assert.throws(() => entry.getOrFail('es'))
  })

  test('toObject', async ({ assert }) => {
    const entry = Translation.fromDbResponse({
      en: 'Hello, world',
      fr: 'Bonjour, monde',
    })!
    assert.deepEqual(entry.toObject(), {
      en: 'Hello, world',
      fr: 'Bonjour, monde',
    })
  })
})
