import { CycliToolbox, PackageJson } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const { filesystem } = toolbox

  const packageJson = (): PackageJson => {
    if (!filesystem.exists('package.json')) {
      throw Error(
        '❗ No package.json found in current directory. Are you sure you are in a project directory?'
      )
    }

    return filesystem.read('package.json', 'json')
  }

  const getName = (): string => {
    return packageJson().name
  }

  toolbox.projectConfig = {
    packageJson,
    getName,
  }
}

export interface ProjectConfigExtension {
  projectConfig: {
    packageJson: () => PackageJson
    getName: () => string
  }
}
