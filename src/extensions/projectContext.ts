import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { PackageManager, ProjectContext } from '../types'
import { LOCK_FILE_TO_MANAGER } from '../constants'
import { lookItUpSync } from 'look-it-up'
import { join, relative } from 'path'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem } = toolbox

  const getPackageManager = (repoRoot: string): PackageManager => {
    const lockFiles = filesystem
      .list(repoRoot)
      .filter((fileName) => LOCK_FILE_TO_MANAGER.has(fileName))

    if (lockFiles.length == 0) {
      throw Error(
        'No lock file found in repository root directory. Are you sure you are in a project directory?'
      )
    }

    const detectedLockFile = LOCK_FILE_TO_MANAGER.get(lockFiles[0])

    if (lockFiles.length > 1) {
      toolbox.interactive.warning(
        `Detected more than one lock file in repository root directory.Proceeding with ${detectedLockFile}.`
      )
    }

    return detectedLockFile
  }

  const getRepoRoot = (): string => {
    return lookItUpSync((dir) =>
      filesystem.exists(filesystem.path(dir, '.git')) ? dir : null
    )
  }

  const getPackageRoot = (): string => {
    if (!filesystem.exists('package.json')) {
      throw Error(
        '❗ No package.json found in current directory. Are you sure you are in a project directory?'
      )
    }

    const packageJson = filesystem.read('package.json', 'json')

    if (packageJson?.workspaces) {
      throw Error(
        '❗ The current directory is workspace root directory. Please run the script again from selected package root directory.'
      )
    }

    return process.cwd()
  }

  const obtain = (): ProjectContext => {
    const repoRoot = getRepoRoot()
    const packageRoot = getPackageRoot()

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
      selectedOptions: [],
    }
  }

  toolbox.projectContext = { obtain }
}
