import { REPOSITORY_SECRETS_HELP_URL } from '../constants'
import { CycliError, CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'
import { recursiveAssign } from '../utils/recursiveAssign'

const FLAG = 'eas'

const patchEasJson = async (
  toolbox: CycliToolbox,
  withIOSCredentials: boolean
): Promise<void> => {
  const patch = {
    build: {
      development: {
        developmentClient: true,
        distribution: 'internal',
        android: {
          buildType: 'apk',
        },
        channel: 'development',
      },
    },
  }

  if (!withIOSCredentials) {
    patch.build.development['ios'] = {
      simulator: true,
    }
  }

  await toolbox.patching.update('eas.json', (config) =>
    recursiveAssign(config, patch)
  )

  toolbox.interactive.step('Configured development profile for EAS Build.')
}

const patchAppJson = async (toolbox: CycliToolbox): Promise<void> => {
  const patch = {
    expo: {
      runtimeVersion: {
        policy: 'fingerprint',
      },
    },
  }

  const appJsonFile = toolbox.projectConfig.appJsonFile()

  if (!appJsonFile) {
    toolbox.interactive.warning(
      `Cannot write to dynamic config. Make sure to set "expo.runtimeVersion.policy" to "fingerprint" in app.config.js.`
    )
    toolbox.furtherActions.push(
      `Set "expo.runtimeVersion.policy" to "fingerprint" in app.config.js.`
    )
  } else {
    await toolbox.patching.update(appJsonFile, (config) =>
      recursiveAssign(config, patch)
    )
  }

  toolbox.interactive.step('Set runtimeVersion policy to "fingerprint".')
}

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating Preview with EAS workflow')

  await toolbox.dependencies.add('expo', context)
  await toolbox.dependencies.add('expo-dev-client', context)
  await toolbox.dependencies.add('expo-updates', context)

  if (!toolbox.filesystem.exists('eas.json')) {
    await toolbox.expo.eas.buildConfigure()
  } else {
    toolbox.interactive.step(
      'Detected eas.json file, skipping EAS Build configuration.'
    )
  }

  await toolbox.expo.prebuild(context, { cleanAfter: true })

  await toolbox.expo.eas.credentialsConfigureBuild({
    platform: 'android',
    environment: 'development',
  })

  const withIOSCredentials = await toolbox.interactive.confirm(
    [
      'Do you want to configure iOS credentials now?',
      'You must have paid Apple Developer account to do this.',
      'If you skip this step, you will only be able to run the iOS app',
      'built by EAS on an iOS simulator (not physical device).\n',
    ].join('\n'),
    {
      type: 'normal',
    }
  )

  if (withIOSCredentials) {
    await toolbox.expo.eas.credentialsConfigureBuild({
      platform: 'ios',
      environment: 'development',
    })
  }

  await toolbox.expo.eas.updateConfigure()

  await patchEasJson(toolbox, withIOSCredentials)
  await patchAppJson(toolbox)

  await toolbox.workflows.generate(join('eas', 'eas.ejf'), context)

  toolbox.interactive.success('Created Preview with EAS workflow.')

  toolbox.interactive.warning(
    `Remember to create repository secret EXPO_TOKEN for Preview with EAS workflow to work properly. For more information check ${REPOSITORY_SECRETS_HELP_URL}`
  )
  toolbox.furtherActions.push(
    `Create EXPO_TOKEN repository secret. More info at ${REPOSITORY_SECRETS_HELP_URL}`
  )
}

const validate = (toolbox: CycliToolbox): void => {
  if (!toolbox.projectConfig.isExpo()) {
    throw CycliError('only supported in expo projects')
  }
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Preview with EAS',
    flag: FLAG,
    description:
      'Generate Preview with EAS workflow to run on every PR (Expo projects only)',
    selectHint: 'generate preview with EAS',
  },
  execute,
  validate,
}

export default recipe
