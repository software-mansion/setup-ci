import { cli } from './utils'
import { version } from '../package.json'

test('prints version', async () => {
  const output = await cli(['--version'])
  expect(output).toContain(version)
})

test('prints help', async () => {
  const output = await cli(['--help'])

  expect(output).toContain(version)

  for (const message of [
    'Welcome to setup-ci',
    'Quickly setup CI workflows for your React Native app',
    '--help',
    '--version',
    '--skip-git-check',
    '-pull-request [...workflows]',
    '-main [...workflows]',
    'Use any combination of the following with --pull-request and --main flags to specify your own set of workflows to generate',
    'lint',
    'jest',
    'ts',
    'prettier',
    'eas',
    'detox',
    'maestro',
  ]) {
    expect(output).toContain(message)
  }
})
