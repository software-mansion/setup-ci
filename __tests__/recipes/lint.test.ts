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

const FLAG = 'lint'
const PRETTIER_FLAG = 'prettier'

describe('lint recipe', () => {
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
    test(`${projectName} lint`, async () => {
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
        'Generating ESLint workflow',
        'Created ESLint workflow.',
      ]) {
        expect(output).toContain(message)
      }

      const packageJson = await getPackageJsonWithoutVersions(
        join(appRoot, 'package.json')
      )
      expect(packageJson).toMatchSnapshot()

      const filesToCheck = [
        join(repoRoot, '.github', 'workflows', `${workflowNamePrefix}lint.yml`),
      ]

      if (!existingConfig?.eslint) {
        filesToCheck.push(join(appRoot, '.eslintrc.json'))
      } else if (existingConfig.eslint !== '.eslintrc.json') {
        expect(existsSync(join(appRoot, '.eslintrc.json'))).toBe(false)
      }

      filesToCheck.forEach((file) => {
        const fileContent = readFileSync(file).toString()
        expect(fileContent).toMatchSnapshot()
      })
    })
  }

  test('with prettier', async () => {
    setupTestProject('rn-setup-ci-yarn-flat')
    const { appRoot } = TEST_PROJECTS['rn-setup-ci-yarn-flat']

    const output = await cli([PRESET_FLAG, `--${FLAG}`, `--${PRETTIER_FLAG}`], {
      cwd: appRoot,
    })

    expect(output).toContain('Created ESLint workflow.')

    const packageJson = await getPackageJsonWithoutVersions(
      join(appRoot, 'package.json')
    )
    expect(packageJson).toMatchSnapshot()

    const eslintrcJson = readFileSync(
      join(appRoot, '.eslintrc.json')
    ).toString()
    expect(eslintrcJson).toMatchSnapshot()
  })
})
