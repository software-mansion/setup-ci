import { CycliToolbox, ProjectContext, Platform, Environment } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const prebuild = async (
    context: ProjectContext,
    { cleanAfter }: { cleanAfter: boolean }
  ): Promise<void> => {
    const existsAndroidDir = toolbox.filesystem.exists('android')
    const existsIOsDir = toolbox.filesystem.exists('ios')

    toolbox.print.info('⚙️ Running expo prebuild to setup app configuration.')

    await toolbox.interactive.spawnSubprocess(
      'Expo prebuild',
      `npx expo prebuild --${context.packageManager}`,
      { alwaysPrintStderr: true }
    )

    if (cleanAfter) {
      if (!existsAndroidDir) toolbox.filesystem.remove('android')
      if (!existsIOsDir) toolbox.filesystem.remove('ios')
    }
  }

  const buildConfigure = async (): Promise<void> => {
    await toolbox.interactive.spawnSubprocess(
      'EAS Build configuration',
      'npx eas-cli build:configure -p all'
    )

    toolbox.interactive.step('Created default EAS Build configuration.')
  }

  const updateConfigure = async (): Promise<void> => {
    await toolbox.interactive.spawnSubprocess(
      'EAS Update configuration',
      'npx eas-cli update:configure'
    )

    toolbox.interactive.step('Created default EAS Update configuration.')
  }

  const credentialsConfigureBuild = async ({
    platform,
    environment,
  }: {
    platform: Platform
    environment: Environment
  }): Promise<void> => {
    const platformName = platform === 'android' ? 'Android' : 'iOS'

    await toolbox.interactive.spawnSubprocess(
      `EAS Credentials configuration for ${platformName}`,
      `npx eas-cli credentials:configure-build -p ${platform} -e ${environment}`
    )

    toolbox.interactive.step(`Configured EAS Credentials for ${platformName}.`)
  }

  toolbox.expo = {
    prebuild,
    eas: {
      buildConfigure,
      updateConfigure,
      credentialsConfigureBuild,
    },
  }
}

export interface ExpoExtension {
  expo: {
    prebuild: (
      context: ProjectContext,
      { cleanAfter }: { cleanAfter: boolean }
    ) => Promise<void>
    eas: {
      buildConfigure: () => Promise<void>
      updateConfigure: () => Promise<void>
      credentialsConfigureBuild: ({
        platform,
        environment,
      }: {
        platform: Platform
        environment: Environment
      }) => Promise<void>
    }
  }
}
