import { REPOSITORY_SECRETS_HELP_URL } from '../constants'
import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'
import { addTerminatingNewline } from '../utils/addTerminatingNewline'
import { recursiveAssign } from '../utils/recursiveAssign'

const FLAG = 'eas-dev-build'

const patchEasJson = async (toolbox: CycliToolbox): Promise<void> => {
  const patch = {
    build: {
      development: {
        developmentClient: true,
        distribution: 'internal',
        android: {
          buildType: 'apk',
        },
        ios: {
          simulator: true,
        },
        channel: 'development',
      },
    },
  }

  await toolbox.patching.update('eas.json', (config) => {
    return recursiveAssign(config, patch)
  })

  addTerminatingNewline('eas.json')

  toolbox.interactive.step('Configured development profile for EAS Build.')
}

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating EAS DevClient Build workflow')

  await toolbox.dependencies.add('expo', context)
  await toolbox.dependencies.add('expo-dev-client', context)
  await toolbox.dependencies.add('expo-updates', context)

  if (toolbox.filesystem.exists('eas.json')) {
    toolbox.interactive.step(
      'Detected eas.json, skipping EAS Build configuration.'
    )
  } else {
    await toolbox.interactive.spawnSubprocess(
      'EAS Build configuration',
      'eas build:configure -p all'
    )

    toolbox.interactive.step('Created default EAS Build configuration.')
  }

  patchEasJson(toolbox)

  await toolbox.interactive.spawnSubprocess(
    'EAS Credentials configuration for Android',
    'eas credentials:configure-build -p android -e development'
  )
  toolbox.interactive.step('Configured EAS Credentials for Android.')

  await toolbox.workflows.generate(join('eas', 'eas-dev-build.ejf'), context)

  toolbox.interactive.success('Created EAS DevClient Build workflow.')

  toolbox.interactive.warning(
    `Remember to create repository secret EXPO_TOKEN for EAS DevClient Build workflow to work properly. For more information check ${REPOSITORY_SECRETS_HELP_URL}`
  )
  toolbox.furtherActions.push(
    `Create EXPO_TOKEN repository secret. More info at ${REPOSITORY_SECRETS_HELP_URL}`
  )
}

const validate = (toolbox: CycliToolbox): string | undefined => {
  if (!toolbox.projectConfig.isExpo()) {
    return 'only supported in expo projects'
  }
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'EAS DevClient Build',
    flag: FLAG,
    description:
      'Generate DevClient Build workflow to run on every PR (Expo projects only)',
    selectHint: 'trigger DevClient EAS Build if native code changes',
  },
  execute,
  validate,
}

export default recipe
