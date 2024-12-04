import { execSync } from 'child_process'
import { CycliToolbox, Platform, Environment } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const prebuild = async ({ cleanAfter }: { cleanAfter: boolean }) => {
    const existsAndroidDir = toolbox.filesystem.exists('android')
    const existsIOsDir = toolbox.filesystem.exists('ios')

    toolbox.print.info('⚙️ Running expo prebuild to setup app configuration.')

    await toolbox.interactive.spawnSubprocess(
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
    await toolbox.interactive.spawnSubprocess(
      'EAS Build configuration',
      'npx eas-cli build:configure -p all',
      {
        onError: async () => {
          await toolbox.interactive.actionPrompt(
            [
              'EAS Build configuration failed. If the reason is missing configuration in dynamic file,',
              'please update it manually before proceeding.\n',
            ].join(' ')
          )
          return true
        },
      }
    )

    toolbox.interactive.step('Created default EAS Build configuration.')
  }

  const updateConfigure = async () => {
    await toolbox.interactive.spawnSubprocess(
      'EAS Update configuration',
      'npx eas-cli update:configure',
      {
        onError: async () => {
          await toolbox.interactive.actionPrompt(
            [
              'EAS Update configuration failed. If the reason is missing configuration in dynamic file,',
              'please update it manually before proceeding.\n',
            ].join(' ')
          )
          return true
        },
      }
    )

    toolbox.interactive.step('Created default EAS Update configuration.')
  }

  const credentialsConfigureBuild = async ({
    platform,
    environment,
  }: {
    platform: Platform
    environment: Environment
  }) => {
    const platformName = platform === 'android' ? 'Android' : 'iOS'

    await toolbox.interactive.spawnSubprocess(
      `EAS Credentials configuration for ${platformName}`,
      `npx eas-cli credentials:configure-build -p ${platform} -e ${environment}`
    )

    toolbox.interactive.step(`Configured EAS Credentials for ${platformName}.`)
  }

  const login = async (): Promise<void> => {
    await toolbox.interactive.spawnSubprocess('EAS Login', 'npx eas-cli login')
    toolbox.interactive.step(`Successfully logged in to EAS.`)
  }

  const whoami = (): string | undefined => {
    let username: string | undefined = undefined

    try {
      username = execSync('npx eas-cli whoami', {
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim()
    } catch (error: unknown) {}

    return username
  }

  const whoamiWithForcedLogin = async (): Promise<string | undefined> => {
    const username = whoami()

    if (!username) {
      await login()
      return whoami()
    }

    return username
  }

  toolbox.expo = {
    prebuild,
    eas: {
      login,
      whoami,
      whoamiWithForcedLogin,
      buildConfigure,
      updateConfigure,
      credentialsConfigureBuild,
    },
  }
}

export interface ExpoExtension {
  expo: {
    prebuild: ({ cleanAfter }: { cleanAfter: boolean }) => Promise<void>
    eas: {
      login: () => Promise<void>
      whoami: () => string | undefined
      whoamiWithForcedLogin: () => Promise<string | undefined>
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
