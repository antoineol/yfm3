import { expect, test } from 'vitest'
import { ping } from '@engine'

test('engine boundary works', () => {
  expect(ping()).toBe('engine-ok')
})
