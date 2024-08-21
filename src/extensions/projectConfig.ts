import { AppJson, CycliToolbox, PackageJson } from '../types'

const APP_JSON_FILES = ['app.json', 'app.config.json']

module.exports = (toolbox: CycliToolbox) => {
  const { filesystem } = toolbox

  const packageJson = (): PackageJson => {
    if (!filesystem.exists('package.json')) {
      throw Error(
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

  toolbox.projectConfig = {
    packageJson,
    appJsonFile,
    appJson,
    isExpo,
    getName,
  }
}

export interface ProjectConfigExtension {
  projectConfig: {
    packageJson: () => PackageJson
    appJsonFile: () => string | undefined
    appJson: () => AppJson | undefined
    isExpo: () => boolean
    getName: () => string
  }
}
