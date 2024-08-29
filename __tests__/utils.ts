import { execSync, spawn } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'
const robot = require('robotjs')

const PATH_TO_BINARY = join(__dirname, '..', 'bin', 'react-native-ci-cli')

const TEST_PROJECTS_FOLDER = 'test-projects'
const TEST_PROJECT_NAME = 'test-project'

export const PATH_TO_TEST_PROJECTS = join(__dirname, '..', TEST_PROJECTS_FOLDER)
const PATH_TO_TEST_PROJECT = join(__dirname, '..', TEST_PROJECT_NAME)

export const PRESET_FLAG = '--preset'

const INSTALL_DEPENDENCIES_COMMAND = {
  yarn: 'yarn',
  npm: 'npm i',
}

export const TEST_PROJECTS = {
  ['rn-setup-ci-yarn-flat']: {
    packageManager: 'yarn',
    remoteUrl: 'https://github.com/km1chno-swm/rn-setup-ci-yarn-flat.git',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: PATH_TO_TEST_PROJECT,
    workflowNamePrefix: '',
  },
  ['rn-setup-ci-npm-flat']: {
    packageManager: 'npm',
    remoteUrl: 'git@github.com:km1chno-swm/rn-setup-ci-npm-flat.git',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: PATH_TO_TEST_PROJECT,
    workflowNamePrefix: '',
  },
  ['rn-setup-ci-yarn-monorepo']: {
    packageManager: 'yarn',
    remoteUrl: 'git@github.com:km1chno-swm/rn-setup-ci-yarn-monorepo.git',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: join(PATH_TO_TEST_PROJECT, 'apps', 'expo-app'),
    workflowNamePrefix: 'expo-app-',
  },
  ['rn-setup-ci-npm-monorepo']: {
    packageManager: 'npm',
    remoteUrl: 'git@github.com:km1chno-swm/rn-setup-ci-npm-monorepo.git',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: join(PATH_TO_TEST_PROJECT, 'apps', 'expo-app'),
    workflowNamePrefix: 'expo-app-',
  },
  ['rn-setup-ci-create-expo-stack']: {
    packageManager: 'npm',
    remoteUrl: 'git@github.com:km1chno-swm/rn-setup-ci-create-expo-stack.git',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: PATH_TO_TEST_PROJECT,
    workflowNamePrefix: '',
    existingConfig: {
      eslint: 'package.json',
      prettier: 'prettier.config.js',
    },
  },
}

// Run scipt in child process. Returns child stdout as string.
// If verbose is set to true, the child stdout will be printed to parent stdout.
export const cli = async (
  flags: string[] = [],
  {
    verbose = false,
    cwd = '.',
    input,
  }: { verbose?: boolean; cwd?: string; input?: Record<string, string[]> } = {
    verbose: false,
    cwd: '.',
  }
): Promise<string> => {
  const subprocessPromise = new Promise<string>((resolve, reject) => {
    const subprocess = spawn(`node ${PATH_TO_BINARY} ${flags.join(' ')}`, {
      shell: true,
      cwd,
      stdio: ['inherit', 'pipe', 'inherit'],
    })

    let output = ''

    subprocess.stdout.on('data', async (data) => {
      if (verbose) {
        process.stdout.write(data)
      }

      if (input) {
        const dataStr: string = data.toString()

        const actionKey = Object.keys(input)
          .map((key): [string, number] => [key, dataStr.lastIndexOf(key)])
          .sort((a, b) => b[1] - a[1])[0]

        if (actionKey[1] !== -1) {
          input[actionKey[0]].forEach((key) => robot.keyTap(key))
        }
      }

      output += data.toString()
    })

    subprocess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`The subprocess exited with code ${code}.`))
      } else {
        resolve(output)
      }
    })

    subprocess.on('error', (err) => {
      reject(err)
    })
  })

  return await subprocessPromise
}

export const installDependencies = (
  appRoot: string,
  packageManager: string
): void => {
  execSync(INSTALL_DEPENDENCIES_COMMAND[packageManager], { cwd: appRoot })
}

export const setupTestProject = (projectName: string): void => {
  if (!existsSync(join(PATH_TO_TEST_PROJECTS, projectName))) {
    execSync(
      `git clone ${TEST_PROJECTS[projectName].remoteUrl} ${join(
        PATH_TO_TEST_PROJECTS,
        projectName
      )}`
    )
  }
  execSync(
    `cp -r ${join(PATH_TO_TEST_PROJECTS, projectName)} ${PATH_TO_TEST_PROJECT}`
  )
}

export const removeTestProject = (): void => {
  execSync(`rm -rf ${PATH_TO_TEST_PROJECT}`)
}

export const getPackageJsonWithoutVersions = async (
  packageJsonPath: string
): Promise<any> => {
  const pkgJson = await import(packageJsonPath)

  return {
    ...pkgJson.default,
    dependencies: Object.keys(pkgJson.default.dependencies).reduce(
      (acc, key) => {
        return {
          ...acc,
          [key]: '',
        }
      },
      {}
    ),
    devDependencies: Object.keys(pkgJson.default.devDependencies).reduce(
      (acc, key) => {
        return {
          ...acc,
          [key]: '',
        }
      },
      {}
    ),
  }
}
