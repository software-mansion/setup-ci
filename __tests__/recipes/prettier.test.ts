import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  cli,
  getPackageJsonWithoutVersions,
  PRESET_FLAG,
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

      const output = await cli([PRESET_FLAG, `--${FLAG}`], {
        cwd: appRoot,
      })

      for (const message of [
        `Detected ${packageManager} as your package manager.`,
        'Generating Prettier check workflow',
        'Created Prettier check workflow.',
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
