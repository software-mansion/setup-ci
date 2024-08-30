import { REPOSITORY_SECRETS_HELP_URL } from '../constants'
import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'

const FLAG = 'eas-update'

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader(
    'Generating Preview with EAS Update workflow'
  )

  toolbox.dependencies.add('expo', context)

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

  await toolbox.interactive.spawnSubprocess(
    'EAS Update configuration',
    'eas update:configure'
  )

  await toolbox.workflows.generate(join('eas', 'eas-update.ejf'), context)

  toolbox.interactive.success('Created EAS Update and Preview workflow.')

  toolbox.interactive.warning(
    `Remember to create repository secret EXPO_TOKEN for EAS Update workflow to work properly. For more information check ${REPOSITORY_SECRETS_HELP_URL}`
  )
  toolbox.furtherActions.push(
    `Create EXPO_TOKEN repository secret. More info at ${REPOSITORY_SECRETS_HELP_URL}`
  )
}

const validate = (toolbox: CycliToolbox): void => {
  if (!toolbox.projectConfig.isExpo()) {
    throw Error('only supported in expo projects')
  }
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Preview with EAS Update',
    flag: FLAG,
    description:
      'Generate Preview with EAS Update workflow to run on every PR (Expo projects only)',
    selectHint: 'generate preview with EAS Update',
  },
  execute,
  validate,
}

export default recipe
