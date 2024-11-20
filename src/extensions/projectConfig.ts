import {
  AppJson,
  CycliError,
  CycliToolbox,
  PackageJson,
  ProjectContext,
} from '../types'
import { join } from 'path'

const APP_JSON_FILES = ['app.json', 'app.config.json']
const DEFAULT_NODE_VERSION = 'v20.17.0'
const DEFAULT_BUN_VERSION = '1.1.30'

module.exports = (toolbox: CycliToolbox) => {
  const { filesystem } = toolbox

  const packageJson = (): PackageJson => {
    if (!filesystem.exists('package.json')) {
      throw CycliError(
        'No package.json found in current directory. Are you sure you are in a project directory?'
      )
    }

    return filesystem.read('package.json', 'json')
  }

  const appJsonFile = (): string | undefined => {
    return APP_JSON_FILES.find((file) => filesystem.exists(file))
  }

  const appJson = (): AppJson | undefined => {
    const file = appJsonFile()

    if (file) {
      return filesystem.read(file, 'json')
    }

    return undefined
  }

  const nodeVersionFileInDirectory = (dir: string): string | undefined => {
    if (filesystem.exists(join(dir, '.nvmrc'))) {
      return join(dir, '.nvmrc')
    } else if (filesystem.exists(join('dir', '.node-version'))) {
      return join(dir, '.node-version')
    } else {
      const packageJson = filesystem.read(join(dir, 'package.json'), 'json')
      if (packageJson?.volta?.node || packageJson?.engines?.node) {
        return join(dir, 'package.json')
      }
    }
    return undefined
  }

  const nodeVersionFile = (context: ProjectContext): string => {
    const { repoRoot, packageRoot } = context.path

    // First, we look for node version in package root.
    // If not found, we look for it in repository root (for monorepo support).
    // If still not found, create .nvmrc in package root with default node version (v20.17.0).
    const file =
      nodeVersionFileInDirectory(packageRoot) ??
      nodeVersionFileInDirectory(repoRoot)

    if (!file) {
      filesystem.write(join(packageRoot, '.nvmrc'), DEFAULT_NODE_VERSION + '\n')

      toolbox.interactive.warning(
        `No node version file found. Created .nvmrc with default node version (${DEFAULT_NODE_VERSION}).`
      )

      toolbox.furtherActions.push(
        [
          `Couldn't retrieve your project's node version. Generated .nvmrc file with default node version (${DEFAULT_NODE_VERSION}).`,
          'Please check if it matches your project and update if necessary.',
        ].join(' ')
      )

      return join(packageRoot, '.nvmrc')
    }

    return file
  }

  const bunVersionFileInDirectory = (dir: string): string | undefined => {
    if (filesystem.exists(join(dir, '.bun-version'))) {
      return join(dir, '.bun-version')
    }
    return undefined
  }

  const bunVersionFile = (context: ProjectContext): string => {
    const { repoRoot, packageRoot } = context.path

    // First, we look for bun version in package root.
    // If not found, we look for it in repository root (for monorepo support).
    // If still not found, create .bun-version in package root with default node version (v1.1.30).
    const file =
      bunVersionFileInDirectory(packageRoot) ??
      bunVersionFileInDirectory(repoRoot)

    if (!file) {
      filesystem.write(
        join(packageRoot, '.bun-version'),
        DEFAULT_BUN_VERSION + '\n'
      )

      toolbox.interactive.warning(
        `No bun version file found. Created .bun-version with default bun version (${DEFAULT_BUN_VERSION}).`
      )

      toolbox.furtherActions.push(
        [
          `Couldn't retrieve your project's bun version. Generated .bun-version file with default bun version (${DEFAULT_BUN_VERSION}).`,
          'Please check if it matches your project and update if necessary.',
        ].join(' ')
      )

      return join(packageRoot, '.bun-version')
    }

    return file
  }

  const isExpo = (): boolean => {
    const appConfig = appJson()

    if (appConfig?.expo) {
      return true
    }

    if (filesystem.exists('app.config.js')) {
      const appJs = filesystem.read('app.config.js')

      if (appJs?.includes('expo:')) {
        return true
      }
    }

    return false
  }

  const getName = (): string => {
    return packageJson().name
  }

  const getAppId = (): string | undefined => {
    let appId = appJson()?.expo?.android?.package

    // If no appId was found in app.json, try to obtain it from native Android code.
    if (!appId) {
      const buildGradlePath = join('android', 'app', 'build.gradle')
      appId = filesystem
        .read(buildGradlePath)
        ?.split('\n')
        .find((line) => line.includes('applicationId'))
        ?.trim()
        .split(' ')[1]
        .replace(/"/g, '')
    }

    return appId
  }

  toolbox.projectConfig = {
    packageJson,
    appJsonFile,
    appJson,
    nodeVersionFile,
    bunVersionFile,
    isExpo,
    getName,
    getAppId,
  }
}

export interface ProjectConfigExtension {
  projectConfig: {
    packageJson: () => PackageJson
    appJsonFile: () => string | undefined
    appJson: () => AppJson | undefined
    nodeVersionFile: (context: ProjectContext) => string
    bunVersionFile: (context: ProjectContext) => string
    isExpo: () => boolean
    getName: () => string
    getAppId: () => string | undefined
  }
}
