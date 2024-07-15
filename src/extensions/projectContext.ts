import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { PackageManager, ProjectContext } from '../types'
import { LOCK_FILE_TO_MANAGER } from '../constants'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem } = toolbox

  const getPackageManager = (): PackageManager => {
    const lockFiles = filesystem
      .list()
      .filter((fileName) => LOCK_FILE_TO_MANAGER.has(fileName))

    if (lockFiles.length == 0) {
      throw Error(
        '❗ No lock file found in current directory. Are you sure this is a React Native project?'
      )
    }

    if (lockFiles.length > 1) {
      toolbox.print.warning(
        `Detected more than one lock file in current directory.`
      )
    }

    return LOCK_FILE_TO_MANAGER.get(lockFiles[0])
  }

  const obtain = (): ProjectContext => ({
    packageManager: getPackageManager(),
  })

  toolbox.projectContext = { obtain }
}
