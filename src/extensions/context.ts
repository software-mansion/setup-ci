import { CycliToolbox, PackageManager } from '../types'
import { LOCK_FILE_TO_MANAGER } from '../constants'
import { lookItUpSync } from 'look-it-up'
import { basename, join, relative } from 'path'

module.exports = (toolbox: CycliToolbox) => {
  const { filesystem } = toolbox

  // State for caching the context
  let packageManager: PackageManager | undefined = undefined
  let repoRoot: string | undefined = undefined
  let packageRoot: string | undefined = undefined

  const getPackageManager = (repoRoot: string): PackageManager => {
    const findPackageManager = (): PackageManager => {
      const lockFiles =
        filesystem
          .list(repoRoot)
          ?.filter((fileName: string) =>
            Object.keys(LOCK_FILE_TO_MANAGER).includes(fileName)
          ) || []

      if (lockFiles.length == 0) {
        throw Error(
          [
            'No lock file found in repository root directory. Are you sure you are in a project directory?',
            'Make sure you generated lock file by installing project dependencies.',
          ].join('\n')
        )
      }

      if (lockFiles.length > 1) {
        toolbox.interactive.warning(
          `Detected more than one lock file in repository root directory. Proceeding with ${lockFiles[0]}.`
        )
      }

      return LOCK_FILE_TO_MANAGER[lockFiles[0]]
    }

    if (!packageManager) {
      packageManager = findPackageManager()
    }

    return packageManager
  }

  const getRepoRoot = (): string => {
    if (!repoRoot) {
      repoRoot =
        lookItUpSync((dir) =>
          filesystem.exists(filesystem.path(dir, '.git')) ? dir : null
        ) || ''
    }

    return repoRoot as string
  }

  const getPackageRoot = (): string => {
    if (!packageRoot) {
      const packageJson = toolbox.projectConfig.packageJson()

      if (packageJson.workspaces) {
        throw Error(
          'The current directory is workspace root directory. Please run the script again from selected package root directory.'
        )
      }
      packageRoot = process.cwd()
    }

    return packageRoot as string
  }

  const relFromRepoRoot = (path: string): string =>
    relative(getRepoRoot(), path) || '.'

  const absFromRepoRoot = (...paths: string[]): string =>
    join(getRepoRoot(), ...paths)

  const repoFolderName = (): string => basename(getRepoRoot())

  const isMonorepo = (): boolean => getRepoRoot() !== getPackageRoot()

  // Check whether ~/.setup-ci exists and creates it if not.
  const isFirstUse = (): boolean => {
    const setupCiDir = join(filesystem.homedir(), '.setup-ci')

    if (!filesystem.exists(setupCiDir)) {
      filesystem.write(setupCiDir, '')
      return true
    }

    return false
  }

  toolbox.context = {
    packageManager: () => getPackageManager(getRepoRoot()),
    isMonorepo,
    isFirstUse,
    path: {
      repoRoot: () => getRepoRoot(),
      packageRoot: () => getPackageRoot(),
      relFromRepoRoot,
      absFromRepoRoot,
      repoFolderName,
    },
    selectedOptions: [],
  }
}

export interface ContextExtension {
  context: {
    packageManager: () => PackageManager
    isMonorepo: () => boolean
    isFirstUse: () => boolean
    path: {
      repoRoot: () => string // absolute path
      packageRoot: () => string // absolute path
      repoFolderName: () => string
      relFromRepoRoot: (path: string) => string // relative path from repoRoot to path
      absFromRepoRoot: (...paths: string[]) => string // absolute path (paths appended to repoRoot)
    }
    selectedOptions: string[]
  }
}
