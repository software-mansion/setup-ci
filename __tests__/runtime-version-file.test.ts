import { join } from 'path'
import { readFileSync } from 'fs'
import {
  cli,
  PULL_REQUEST_FLAG,
  removeTestProject,
  setupTestProject,
  TEST_PROJECTS,
} from './utils'

const EXPECTED_NODE_VERSION = 'v20.17.0'
const EXPECTED_BUN_VERSION = '1.1.30'

describe('should create runtime version files if necessary', () => {
  afterEach(removeTestProject)

  test('creates .nvmrc if necessary', async () => {
    const { appRoot } = TEST_PROJECTS['rn-setup-ci-create-expo-stack']
    setupTestProject('rn-setup-ci-create-expo-stack')

    const output = await cli(['--skip-git-check', PULL_REQUEST_FLAG, 'lint'], {
      cwd: appRoot,
    })

    const nvmrc = readFileSync(join(appRoot, '.nvmrc')).toString()
    expect(nvmrc).toBe(`${EXPECTED_NODE_VERSION}\n`)

    expect(output).toContain(
      [
        'No node version file found.',
        `Created .nvmrc with default node version (${EXPECTED_NODE_VERSION}).`,
      ].join(' ')
    )
    expect(output).toContain(
      [
        "Couldn't retrieve your project's node version.",
        `Generated .nvmrc file with default node version (${EXPECTED_NODE_VERSION}).`,
        'Please check if it matches your project and update if necessary.',
      ].join(' ')
    )
  })

  test('creates .bun-version if necessary', async () => {
    const { appRoot } = TEST_PROJECTS['rn-setup-ci-create-expo-stack-bun']
    setupTestProject('rn-setup-ci-create-expo-stack-bun')

    const output = await cli(['--skip-git-check', PULL_REQUEST_FLAG, 'lint'], {
      cwd: appRoot,
    })

    const bunVersion = readFileSync(join(appRoot, '.bun-version')).toString()
    expect(bunVersion).toBe(`${EXPECTED_BUN_VERSION}\n`)

    expect(output).toContain(
      [
        'No bun version file found.',
        `Created .bun-version with default bun version (${EXPECTED_BUN_VERSION}).`,
      ].join(' ')
    )
    expect(output).toContain(
      [
        "Couldn't retrieve your project's bun version.",
        `Generated .bun-version file with default bun version (${EXPECTED_BUN_VERSION}).`,
        'Please check if it matches your project and update if necessary.',
      ].join(' ')
    )
  })
})
