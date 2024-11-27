import { readFileSync } from 'fs'
import { join } from 'path'
import {
  cli,
  getPackageJsonWithoutVersions,
  installDependencies,
  NON_INTERACTIVE_FLAG,
  PRESET_FLAG,
  removeTestProject,
  setupTestProject,
  TEST_PROJECTS,
} from '../utils'

const FLAG = 'detox'

describe('detox recipe', () => {
  afterEach(removeTestProject)

  const NON_EXPO_PROJECTS = ['rn-setup-ci-yarn-flat', 'rn-setup-ci-npm-flat']

  const EXPO_PROJECTS = [
    'rn-setup-ci-yarn-monorepo',
    'rn-setup-ci-npm-monorepo',
    'rn-setup-ci-create-expo-stack',
    'rn-setup-ci-create-expo-stack-bun',
  ]

  const checkModifiedFiles = (
    appRoot: string,
    repoRoot: string,
    workflowNamePrefix: string
  ) => {
    const filesToCheck = [
      join(appRoot, '.detoxrc-ci.js'),
      join(appRoot, 'app.json'),
      join(appRoot, 'e2e', 'jest.config.js'),
      join(appRoot, 'e2e', 'starter.test.ts'),
      join(
        repoRoot,
        '.github',
        'workflows',
        `${workflowNamePrefix}build-release-android.yml`
      ),
      join(
        repoRoot,
        '.github',
        'workflows',
        `${workflowNamePrefix}build-release-ios.yml`
      ),
      join(
        repoRoot,
        '.github',
        'workflows',
        `${workflowNamePrefix}test-detox-android.yml`
      ),
      join(
        repoRoot,
        '.github',
        'workflows',
        `${workflowNamePrefix}test-detox-ios.yml`
      ),
    ]

    filesToCheck.forEach((file) => {
      const fileContent = readFileSync(file).toString()
      expect(fileContent).toMatchSnapshot()
    })
  }

  for (const projectName of NON_EXPO_PROJECTS) {
    test(`${projectName} detox`, async () => {
      setupTestProject(projectName)
      const { packageManager, repoRoot, appRoot, workflowNamePrefix } =
        TEST_PROJECTS[projectName]

      const output = await cli(
        [PRESET_FLAG, NON_INTERACTIVE_FLAG, `--${FLAG}`],
        {
          cwd: appRoot,
        }
      )

      for (const message of [
        'You have chosen to setup Detox for a non-expo project.',
        'To make the setup work properly, you need to manually patch native code for Detox.',
        'Please follow the instructions in Step 4 of',
        'https://wix.github.io/Detox/docs/next/introduction/project-setup/#step-4-additional-android-configuration.',
        'You can do it now or after the script finishes.',
        `Detected ${packageManager} as your package manager.`,
        'Generating Detox workflow',
        'Created Android release build workflow.',
        'Created iOS release build workflow.',
        'Consider adding "modulePathIgnorePatterns": ["e2e"] to your jest config.',
        'Remember to edit example test in e2e/starter.test.ts to match your app.',
        'Created Detox workflow.',
        'Follow Step 4 of https://wix.github.io/Detox/docs/next/introduction/project-setup/#step-4-additional-android-configuration to patch native code for Detox.',
      ]) {
        expect(output).toContain(message)
      }

      const packageJson = await getPackageJsonWithoutVersions(
        join(appRoot, 'package.json')
      )
      expect(packageJson).toMatchSnapshot()

      checkModifiedFiles(appRoot, repoRoot, workflowNamePrefix)
    })
  }

  for (const projectName of EXPO_PROJECTS) {
    test(`${projectName} detox`, async () => {
      setupTestProject(projectName)
      const { packageManager, repoRoot, appRoot, workflowNamePrefix } =
        TEST_PROJECTS[projectName]

      installDependencies(appRoot, packageManager)

      const output = await cli([PRESET_FLAG, `--${FLAG}`], {
        cwd: appRoot,
      })

      for (const message of [
        `Detected ${packageManager} as your package manager.`,
        'Generating Detox workflow',
        'Running Expo prebuild...',
        'Finished running Expo prebuild.',
        'Created Android release build workflow.',
        'Created iOS release build workflow.',
        'Consider adding "modulePathIgnorePatterns": ["e2e"] to your jest config.',
        'Remember to edit example test in e2e/starter.test.ts to match your app.',
        'Created Detox workflow.',
      ]) {
        expect(output).toContain(message)
      }

      const packageJson = await getPackageJsonWithoutVersions(
        join(appRoot, 'package.json')
      )
      expect(packageJson).toMatchSnapshot()

      checkModifiedFiles(appRoot, repoRoot, workflowNamePrefix)
    })
  }
})
