import { cli } from './utils'
import { version } from '../package.json'

test('prints version', async () => {
  const output = await cli(['--version'])
  expect(output).toContain(version)
})

test('prints help', async () => {
  const output = await cli(['--help'])

  expect(output).toContain(version)

  const outputWithoutVersion = (await output).replace(version, '')
  expect(outputWithoutVersion).toMatchSnapshot()
})
