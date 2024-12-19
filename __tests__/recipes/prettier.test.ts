import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  cli,
  getPackageJsonWithoutVersions,
  PULL_REQUEST_FLAG,
  removeTestProject,
  setupTestProject,
  TEST_PROJECTS,
} from '../utils'

const FLAG = 'prettier'

describe('prettier check recipe', () => {
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
    test(`${projectName} prettier check`, async () => {
      setupTestProject(projectName)
      const {
        packageManager,
        repoRoot,
        appRoot,
        workflowNamePrefix,
        existingConfig,
      } = TEST_PROJECTS[projectName]

      const output = await cli([PULL_REQUEST_FLAG, FLAG], {
        cwd: appRoot,
      })

      for (const message of [
        `Detected ${packageManager} as your package manager.`,
        'Configuring project for Prettier check',
        'Created Prettier check workflow for events: [pull_request]',
      ]) {
        expect(output).toContain(message)
      }

      const packageJson = await getPackageJsonWithoutVersions(
        join(appRoot, 'package.json')
      )
      expect(packageJson).toMatchSnapshot()

      const filesToCheck = [
        join(
          repoRoot,
          '.github',
          'workflows',
          `${workflowNamePrefix}prettier.yml`
        ),
      ]

      if (!existingConfig?.prettier) {
        filesToCheck.push(join(appRoot, '.prettierrc'))
        filesToCheck.push(join(appRoot, '.prettierignore'))
      } else if (existingConfig.prettier !== '.prettierrc') {
        expect(existsSync(join(appRoot, '.prettierrc'))).toBe(false)
      }

      filesToCheck.forEach((file) => {
        const fileContent = readFileSync(file).toString()
        expect(fileContent).toMatchSnapshot()
      })
    })
  }
})
