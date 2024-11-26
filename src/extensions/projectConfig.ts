import {
  AppJson,
  CycliError,
  CycliToolbox,
  PackageJson,
  ProjectContext,
} from '../types'
import { join } from 'path'
import { recursiveAssign } from '../utils/recursiveAssign'

const APP_JSON_FILES = ['app.json', 'app.config.json']
const APP_JS_FILES = ['app.js', 'app.config.js']

const DEFAULT_NODE_VERSION = 'v20.17.0'

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

  const appJsFile = (): string | undefined => {
    return APP_JS_FILES.find((file) => filesystem.exists(file))
  }

  const appJson = (): AppJson | undefined => {
    const file = appJsonFile()

    if (file) {
      return filesystem.read(file, 'json')
    }

    return undefined
  }

  const appJs = (): string | undefined => {
    const file = appJsFile()

    if (file) {
      return filesystem.read(file)
    }

    return undefined
  }

  const patchAppConfig = async (
    patch: Record<string, unknown>,
    allowChangeAfterScript = true
  ): Promise<void> => {
    const configFile = appJsonFile()

    if (!configFile) {
      const dynamicConfigFile = appJsFile()
      const prettyPatch = JSON.stringify(patch, null, 2)

      let actionPromptMessage =
        'Cannot write to dynamic config. ' +
        `Please update ${dynamicConfigFile} with the following values:` +
        `\n\n${prettyPatch}\n\n`

      if (allowChangeAfterScript) {
        actionPromptMessage +=
          'You can do it now or after the script finishes.\n'
      } else {
        actionPromptMessage += 'Please do it before proceeding.\n'
      }

      await toolbox.interactive.actionPrompt(actionPromptMessage)

      if (allowChangeAfterScript) {
        toolbox.furtherActions.push(
          `Update ${dynamicConfigFile} with` + `\n\n${prettyPatch}`
        )
      }
    } else {
      await toolbox.patching.update(
        configFile,
        (config: Record<string, unknown>) => recursiveAssign(config, patch)
      )
    }
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

  const isExpo = (): boolean => {
    const appConfig = appJson()

    if (appConfig?.expo) {
      return true
    }

    const dynamicAppConfig = appJs()

    if (dynamicAppConfig?.includes('expo:')) {
      return true
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

  const validateAppName = (name: string): string | void => {
    if (name.length === 0) {
      return 'App name cannot be empty'
    }
    if (!name.match(/^[a-zA-Z]/)) {
      return 'App name must start with a letter'
    }
    if (!name.match(/^[\w_\.]*$/)) {
      return 'App name can consist only of alphanumeric characters, dots and underscores'
    }
    if (name.match(/\.[0-9_]/) || name[name.length - 1] === '.') {
      return 'Each dot must be followed by a letter'
    }
  }

  // Check if android package name and iOS bundle identifier is defined in app.json/js expo field.
  // If not, prompt user to define them.
  const checkAppNameInConfigOrGenerate = async (): Promise<void> => {
    const isAndroidPackageNameDefined =
      appJson()?.expo?.android?.package ||
      appJs()?.match(/android:[\s\S]*package:/)

    const isIOSBundleIdentifierDefined =
      appJson()?.expo?.ios?.bundleIdentifier ||
      appJs()?.match(/ios:[\s\S]*bundleIdentifier:/)

    if (!isAndroidPackageNameDefined || !isIOSBundleIdentifierDefined) {
      const suggestedAppName = [
        'com',
        (await toolbox.expo.eas.whoamiWithForcedLogin()) ?? 'yourusername',
        appJson()?.expo?.slug ?? getName(),
      ]
        .join('.')
        .replace(/-/g, '')

      const patch = { expo: {} }

      if (!isAndroidPackageNameDefined) {
        const packageName = await toolbox.interactive.textInput(
          'What would you like your Android package name to be?',
          suggestedAppName,
          suggestedAppName,
          validateAppName
        )

        patch.expo['android'] = { package: packageName }
      }

      if (!isIOSBundleIdentifierDefined) {
        const bundleIdentifier = await toolbox.interactive.textInput(
          'What would you like your iOS bundle identifier to be?',
          suggestedAppName,
          suggestedAppName,
          validateAppName
        )

        patch.expo['ios'] = { bundleIdentifier }
      }

      await patchAppConfig(patch, false)
    }
  }

  toolbox.projectConfig = {
    packageJson,
    appJsonFile,
    appJson,
    patchAppConfig,
    nodeVersionFile,
    isExpo,
    getName,
    getAppId,
    checkAppNameInConfigOrGenerate,
  }
}

export interface ProjectConfigExtension {
  projectConfig: {
    packageJson: () => PackageJson
    appJsonFile: () => string | undefined
    appJson: () => AppJson | undefined
    patchAppConfig: (
      patch: Record<string, unknown>,
      allowChangeAfterScript?: boolean
    ) => Promise<void>
    nodeVersionFile: (context: ProjectContext) => string
    isExpo: () => boolean
    getName: () => string
    getAppId: () => string | undefined
    checkAppNameInConfigOrGenerate: () => Promise<void>
  }
}
