import { readFileSync } from 'fs'
import { join } from 'path'
import {
  cli,
  getPackageJsonWithoutVersions,
  PULL_REQUEST_FLAG,
  removeTestProject,
  setupTestProject,
  TEST_PROJECTS,
} from '../utils'

const FLAG = 'jest'

describe('jest recipe', () => {
  afterEach(removeTestProject)

  const PROJECTS = [
    'rn-setup-ci-yarn-flat',
    'rn-setup-ci-npm-flat',
    'rn-setup-ci-yarn-monorepo',
    'rn-setup-ci-npm-monorepo',
    'rn-setup-ci-create-expo-stack',
    'rn-setup-ci-create-expo-stack-bun',
    'rn-setup-ci-create-expo-stack-pnpm',
  ]

  for (const projectName of PROJECTS) {
    test(`${projectName} jest`, async () => {
      setupTestProject(projectName)
      const { packageManager, repoRoot, appRoot, workflowNamePrefix } =
        TEST_PROJECTS[projectName]

      const output = await cli([PULL_REQUEST_FLAG, FLAG], {
        cwd: appRoot,
      })

      for (const message of [
        `Detected ${packageManager} as your package manager.`,
        'Configuring project for Jest',
        'Created Jest workflow for events: [pull_request]',
      ]) {
        expect(output).toContain(message)
      }

      const packageJson = await getPackageJsonWithoutVersions(
        join(appRoot, 'package.json')
      )
      expect(packageJson).toMatchSnapshot()

      const filesToCheck = [
        join(appRoot, 'jest.config.json'),
        join(repoRoot, '.github', 'workflows', `${workflowNamePrefix}jest.yml`),
      ]

      filesToCheck.forEach((file) => {
        const fileContent = readFileSync(file).toString()
        expect(fileContent).toMatchSnapshot()
      })
    })
  }
})
