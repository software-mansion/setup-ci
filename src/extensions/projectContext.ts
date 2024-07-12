import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { PackageManager, ProjectContext } from '../types'
import { LOCK_FILE_TO_MANAGER } from '../constants'
import { lookItUpSync } from 'look-it-up'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem } = toolbox

  const getPackageManager = (root: string): PackageManager => {
    const lockFiles = filesystem
      .list(root)
      .filter((fileName) => LOCK_FILE_TO_MANAGER.has(fileName))

    if (lockFiles.length == 0) {
      throw Error(
        '❗ No lock file found in root directory. Are you sure this is a React Native project?'
      )
    }

    if (lockFiles.length > 1) {
      toolbox.print.warning(
        `Detected more than one lock file in root directory.`
      )
    }

    return LOCK_FILE_TO_MANAGER.get(lockFiles[0])
  }

  const getMonorepoRoot = (): string | null => {
    return lookItUpSync((dir) => {
      const packageJson = filesystem.read(
        filesystem.path(dir, 'package.json'),
        'json'
      )

      return packageJson?.workspaces ? dir : null
    })
  }

  const getPackageRoot = (): string => {
    if (!toolbox.filesystem.exists('package.json')) {
      throw Error(
        '❗ No package.json found in current directory. Are you sure this is a React Native project?'
      )
    }
    return process.cwd()
  }

  const obtain = (): ProjectContext => {
    const monorepoRoot = getMonorepoRoot()
    const packageRoot = getPackageRoot()

    return {
      packageManager: getPackageManager(monorepoRoot ?? packageRoot),
      monorepoRoot,
      packageRoot,
    }
  }

  toolbox.projectContext = { obtain }
}
