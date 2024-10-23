import { execSync, spawn } from 'child_process'
import { join } from 'path'

const PATH_TO_BINARY = join(__dirname, '..', 'bin', 'setup-ci')

const TEST_PROJECTS_FOLDER = 'test-projects'
const TEST_PROJECT_NAME = 'test-project'

export const PATH_TO_TEST_PROJECTS = join(__dirname, TEST_PROJECTS_FOLDER)
const PATH_TO_TEST_PROJECT = join(__dirname, TEST_PROJECT_NAME)

export const NON_INTERACTIVE_FLAG = '--non-interactive'
export const PRESET_FLAG = '--preset'

const INSTALL_DEPENDENCIES_COMMAND = {
  yarn: 'yarn',
  npm: 'npm i',
}

export const TEST_PROJECTS = {
  ['rn-setup-ci-yarn-flat']: {
    packageManager: 'yarn',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: PATH_TO_TEST_PROJECT,
    workflowNamePrefix: '',
  },
  ['rn-setup-ci-npm-flat']: {
    packageManager: 'npm',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: PATH_TO_TEST_PROJECT,
    workflowNamePrefix: '',
  },
  ['rn-setup-ci-yarn-monorepo']: {
    packageManager: 'yarn',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: join(PATH_TO_TEST_PROJECT, 'apps', 'expo-app'),
    workflowNamePrefix: 'expo-app-',
  },
  ['rn-setup-ci-npm-monorepo']: {
    packageManager: 'npm',
    repoRoot: PATH_TO_TEST_PROJECT,
    appRoot: join(PATH_TO_TEST_PROJECT, 'apps', 'expo-app'),
    workflowNamePrefix: 'expo-app-',
  },
  ['rn-setup-ci-create-expo-stack']: {
    packageManager: 'npm',
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
  { verbose = false, cwd = '.' }: { verbose?: boolean; cwd?: string } = {
    verbose: false,
    cwd: '.',
  }
): Promise<string> => {
  const subprocessPromise = new Promise<string>((resolve, reject) => {
    const subprocess = spawn(
      `node ${PATH_TO_BINARY} --skip-telemetry ${flags.join(' ')}`,
      {
        shell: true,
        cwd,
        stdio: ['inherit', 'pipe', 'inherit'],
      }
    )

    let output = ''

    subprocess.stdout.on('data', async (data) => {
      if (verbose) {
        process.stdout.write(data)
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
  execSync(
    [
      `cp -r ${join(
        PATH_TO_TEST_PROJECTS,
        projectName
      )} ${PATH_TO_TEST_PROJECT}`,
      `cd ${PATH_TO_TEST_PROJECT}`,
      'git init',
      'git config --local user.email "email"',
      'git config --local user.name "name"',
      'git add .',
      'git commit -m "Initial commit"',
    ].join(' && ')
  )
}

export const removeTestProject = (): void => {
  execSync(`rm -rf ${PATH_TO_TEST_PROJECT}`)
}

export const getPackageJsonWithoutVersions = async (
  packageJsonPath: string
): Promise<unknown> => {
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
