import { AppJson, CycliError, CycliToolbox, PackageJson } from '../types'
import { join } from 'path'
import { recursiveAssign } from '../utils/recursiveAssign'

const APP_JSON_FILES = ['app.json', 'app.config.json']
const APP_JS_FILES = ['app.js', 'app.config.js', 'app.ts', 'app.config.ts']

const DEFAULT_NODE_VERSION = 'v20.17.0'
const DEFAULT_BUN_VERSION = '1.1.30'

module.exports = (toolbox: CycliToolbox) => {
  const { filesystem } = toolbox

  // State for caching the config
  let expo: boolean | undefined = undefined
  let iOSAppName: string | undefined = undefined

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

  const nodeVersionFile = (): string => {
    const packageRoot = toolbox.context.path.packageRoot()
    const repoRoot = toolbox.context.path.repoRoot()

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

  const bunVersionFile = (): string => {
    const packageRoot = toolbox.context.path.packageRoot()
    const repoRoot = toolbox.context.path.repoRoot()

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
    if (expo !== undefined) {
      return expo
    }

    const appConfig = appJson()

    if (appConfig?.expo) {
      expo = true
    } else {
      const dynamicAppConfig = appJs()
      expo = dynamicAppConfig?.includes('expo:') || false
    }

    return expo
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

  const getIOSAppName = async (): Promise<string> => {
    if (iOSAppName != undefined) {
      return iOSAppName
    }

    const existsAndroidDir = toolbox.filesystem.exists('android')
    const existsIOsDir = toolbox.filesystem.exists('ios')

    if (isExpo()) {
      await toolbox.expo.prebuild({ cleanAfter: false })
    }

    iOSAppName = toolbox.filesystem
      .list('ios')
      ?.find((file) => file.endsWith('.xcodeproj'))
      ?.replace('.xcodeproj', '')

    if (!iOSAppName) {
      throw CycliError(
        'Failed to obtain iOS app name. Perhaps your ios/ directory is missing *.xcodeproj file.'
      )
    }

    if (!existsAndroidDir) toolbox.filesystem.remove('android')
    if (!existsIOsDir) toolbox.filesystem.remove('ios')

    return iOSAppName
  }

  toolbox.projectConfig = {
    packageJson,
    appJsonFile,
    appJson,
    appJs,
    patchAppConfig,
    nodeVersionFile,
    bunVersionFile,
    isExpo,
    getName,
    getAppId,
    checkAppNameInConfigOrGenerate,
    getIOSAppName,
  }
}

export interface ProjectConfigExtension {
  projectConfig: {
    packageJson: () => PackageJson
    appJsonFile: () => string | undefined
    appJson: () => AppJson | undefined
    nodeVersionFile: () => string
    bunVersionFile: () => string
    appJs: () => string | undefined
    patchAppConfig: (
      patch: Record<string, unknown>,
      allowChangeAfterScript?: boolean
    ) => Promise<void>
    isExpo: () => boolean
    getName: () => string
    getAppId: () => string | undefined
    checkAppNameInConfigOrGenerate: () => Promise<void>
    getIOSAppName: () => Promise<string>
  }
}
