import {
  CycliError,
  CycliToolbox,
  PackageManager,
  ProjectContext,
} from '../types'
import { LOCK_FILE_TO_MANAGER } from '../constants'
import { lookItUpSync } from 'look-it-up'
import { basename, join, relative } from 'path'

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
      throw CycliError(
        [
          'No lock file found in repository root directory. Are you sure you are in a project directory?',
          'Make sure you generated lock file by installing project dependencies.',
        ].join('\n')
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

  const getRepoRoot = (): string => {
    return (
      lookItUpSync((dir) =>
        filesystem.exists(filesystem.path(dir, '.git')) ? dir : null
      ) || ''
    )
  }

  const getPackageRoot = (): string => {
    const packageJson = toolbox.projectConfig.packageJson()

    if (packageJson.workspaces) {
      throw CycliError(
        'The current directory is workspace root directory. Please run the script again from selected package root directory.'
      )
    }

    return process.cwd()
  }

  // Check whether ~/.setup-ci exists and creates it if not.
  const isFirstUse = (): boolean => {
    const setupCiDir = join(filesystem.homedir(), '.setup-ci')

    if (!filesystem.exists(setupCiDir)) {
      filesystem.write(setupCiDir, '')
      return true
    }

    return false
  }

  const obtain = (): ProjectContext => {
    const firstUse = isFirstUse()
    const repoRoot = getRepoRoot()
    const packageRoot = getPackageRoot()

    const relFromRepoRoot = (path: string): string =>
      relative(repoRoot, path) || '.'

    const absFromRepoRoot = (...paths: string[]): string =>
      join(repoRoot, ...paths)

    const repoFolderName = basename(repoRoot)

    return {
      packageManager: getPackageManager(repoRoot),
      path: {
        repoRoot,
        packageRoot,
        repoFolderName,
        relFromRepoRoot,
        absFromRepoRoot,
      },
      selectedOptions: [],
      firstUse,
    }
  }

  toolbox.projectContext = { obtain }
}

export interface ProjectContextExtension {
  projectContext: {
    obtain: () => ProjectContext
  }
}
