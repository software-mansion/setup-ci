import { REPOSITORY_SECRETS_HELP_LINK } from '../constants'
import { CycliRecipe, CycliToolbox, ProjectContext, RunResult } from '../types'
import { join } from 'path'

const FLAG = 'eas-update'

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    toolbox.dependencies.add('expo', context)

    if (toolbox.filesystem.exists('eas.json')) {
      toolbox.interactive.step(
        'Detected eas.json, skipping EAS Build configuration.'
      )
    } else {
      await toolbox.system.spawn('eas build:configure -p all', {
        stdio: 'inherit',
      })

      toolbox.interactive.step('Created default EAS Build configuration.')
    }

    await toolbox.system.spawn('eas update:configure', {
      stdio: 'inherit',
    })

    await toolbox.workflows.generate(join('eas', 'eas-update.ejf'), context)

    toolbox.interactive.step('Created EAS Update workflow.')

    toolbox.interactive.warning(
      `Remember to create repository secret EXPO_TOKEN for EAS Update workflow to work properly. For more information check ${REPOSITORY_SECRETS_HELP_LINK}`
    )
    toolbox.furtherActions.push(
      `Create EXPO_TOKEN repository secret. More info at ${REPOSITORY_SECRETS_HELP_LINK}`
    )

    return `--${FLAG}`
  }

const run = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<RunResult> => {
  if (toolbox.options.isRecipeSelected(FLAG)) {
    context.selectedOptions.push(FLAG)
    return execute()
  }

  if (toolbox.options.isPreset()) {
    return null
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run EAS Update on your project on every PR? (Expo projects only)',
    { type: 'normal' }
  )

  if (!proceed) {
    return null
  }

  context.selectedOptions.push(FLAG)
  return execute()
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
