import { assert } from '@japa/assert'
import { configure, processCLIArgs, run } from '@japa/runner'
import { fileSystem } from '@japa/file-system'

processCLIArgs(process.argv.splice(2))

configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [
    assert(),
    fileSystem({
      basePath: new URL('../test-helpers/fs-plugin/', import.meta.url),
    }),
  ],
})

run()
