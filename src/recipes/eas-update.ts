import { REPOSITORY_SECRETS_HELP_URL } from '../constants'
import { CycliRecipe, CycliToolbox, ProjectContext, RunResult } from '../types'
import { join } from 'path'

const FLAG = 'eas-update'

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    toolbox.interactive.vspace()
    toolbox.interactive.sectionHeader(
      'Genereating EAS Update and Preview workflow'
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

    return `--${FLAG}`
  }

const run = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<RunResult> => {
  let runRecipe = false

  if (toolbox.options.isRecipeSelected(FLAG)) {
    runRecipe = true
  } else if (!toolbox.options.isPreset()) {
    runRecipe = await toolbox.interactive.confirm(
      'Do you want to run EAS Update on your project on every PR? (Expo projects only)',
      { type: 'normal' }
    )
  }

  if (runRecipe) {
    // EAS Update recipes is currently supported only for Expo projects
    if (!toolbox.projectConfig.isExpo()) {
      throw Error('EAS Update workflow is supported only for Expo projects.')
    }

    context.selectedOptions.push(FLAG)

    return execute()
  }

  return null
}

export const recipe: CycliRecipe = {
  meta: {
    flag: FLAG,
    description:
      'Generate EAS Update and preview workflow to run on every PR (Expo projects only)',
  },
  run,
}

export default recipe
