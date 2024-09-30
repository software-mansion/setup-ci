import { CycliToolbox, Platform, Environment } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const prebuild = ({ cleanAfter }: { cleanAfter: boolean }) => {
    const existsAndroidDir = toolbox.filesystem.exists('android')
    const existsIOsDir = toolbox.filesystem.exists('ios')

    toolbox.print.info('⚙️ Running expo prebuild to setup app configuration.')

    toolbox.interactive.spawnSubprocess(
      'Expo prebuild',
      `npx expo prebuild --${toolbox.context.packageManager()}`,
      { alwaysPrintStderr: true }
    )

    if (cleanAfter) {
      if (!existsAndroidDir) toolbox.filesystem.remove('android')
      if (!existsIOsDir) toolbox.filesystem.remove('ios')
    }
  }

  const buildConfigure = async (): Promise<void> => {
    toolbox.interactive.spawnSubprocess(
      'EAS Build configuration',
      'npx eas-cli build:configure -p all'
    )

    toolbox.interactive.step('Created default EAS Build configuration.')
  }

  const updateConfigure = async () => {
    toolbox.interactive.spawnSubprocess(
      'EAS Update configuration',
      'npx eas-cli update:configure'
    )

    toolbox.interactive.step('Created default EAS Update configuration.')
  }

  const credentialsConfigureBuild = ({
    platform,
    environment,
  }: {
    platform: Platform
    environment: Environment
  }) => {
    const platformName = platform === 'android' ? 'Android' : 'iOS'

    toolbox.interactive.spawnSubprocess(
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
    prebuild: ({ cleanAfter }: { cleanAfter: boolean }) => void
    eas: {
      buildConfigure: () => void
      updateConfigure: () => void
      credentialsConfigureBuild: ({
        platform,
        environment,
      }: {
        platform: Platform
        environment: Environment
      }) => void
    }
  }
}
