import {
  CycliToolbox,
  PackageJson,
  PackageManager,
  ProjectContext,
} from '../types'
import { LOCK_FILE_TO_MANAGER } from '../constants'
import { lookItUpSync } from 'look-it-up'
import { join, relative } from 'path'

module.exports = (toolbox: CycliToolbox) => {
  const { filesystem } = toolbox

  const getPackageManager = (repoRoot: string): PackageManager => {
    const lockFiles =
      filesystem
        .list(repoRoot)
        ?.filter((fileName: string) =>
          Object.keys(LOCK_FILE_TO_MANAGER).includes(fileName)
        ) || []

    if (lockFiles.length == 0) {
      throw Error(
        'No lock file found in repository root directory. Are you sure you are in a project directory?'
      )
    }

    const detectedLockFile = LOCK_FILE_TO_MANAGER[lockFiles[0]]

    if (lockFiles.length > 1) {
      toolbox.interactive.warning(
        `Detected more than one lock file in repository root directory.Proceeding with ${detectedLockFile}.`
      )
    }

    return detectedLockFile
  }

  const getPackageJson = (): PackageJson => {
    if (!filesystem.exists('package.json')) {
      throw Error(
        '❗ No package.json found in current directory. Are you sure you are in a project directory?'
      )
    }

    return filesystem.read('package.json', 'json')
  }

  const getRepoRoot = (): string => {
    return (
      lookItUpSync((dir) =>
        filesystem.exists(filesystem.path(dir, '.git')) ? dir : null
      ) || ''
    )
  }

  const getPackageRoot = (packageJson: PackageJson): string => {
    if (packageJson.workspaces) {
      throw Error(
        '❗ The current directory is workspace root directory. Please run the script again from selected package root directory.'
      )
    }

    return process.cwd()
  }

  const obtain = (): ProjectContext => {
    const packageJson = getPackageJson()

    const repoRoot = getRepoRoot()
    const packageRoot = getPackageRoot(packageJson)

    const relFromRepoRoot = (path: string): string =>
      relative(repoRoot, path) || '.'

    const absFromRepoRoot = (...paths: string[]): string =>
      join(repoRoot, ...paths)

    return {
      packageManager: getPackageManager(repoRoot),
      path: {
        repoRoot,
        packageRoot,
        relFromRepoRoot,
        absFromRepoRoot,
      },
      packageJson,
    }
  }

  toolbox.projectContext = { obtain }
}

export interface ProjectContextExtension {
  projectContext: {
    obtain: () => ProjectContext
  }
}
