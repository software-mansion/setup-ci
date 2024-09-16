import { rm } from 'fs/promises'
import { join } from 'path'
import {
  cli,
  removeTestProject,
  setupTestProject,
  TEST_PROJECTS,
} from './utils'

describe('fail fast scenarios', () => {
  afterEach(removeTestProject)

  test('fails when cwd has no package.json', async () => {
    const { appRoot } = TEST_PROJECTS['rn-setup-ci-yarn-flat']
    setupTestProject('rn-setup-ci-yarn-flat')

    await rm(join(appRoot, 'package.json'))

    const output = await cli(['--skip-git-check'], { cwd: appRoot })

    expect(output).toContain(
      'No package.json found in current directory. Are you sure you are in a project directory?'
    )
  })

  test('fails when cwd is monorepo root', async () => {
    const { repoRoot } = TEST_PROJECTS['rn-setup-ci-yarn-monorepo']
    setupTestProject('rn-setup-ci-yarn-monorepo')

    const output = await cli([], { cwd: repoRoot })

    expect(output).toContain(
      'The current directory is workspace root directory. Please run the script again from selected package root directory.'
    )
  })
})
