import { REPOSITORY_SECRETS_HELP_URL } from '../constants'
import {
  CycliRecipe,
  CycliToolbox,
  ExecutorResult,
  ProjectContext,
} from '../types'
import { join } from 'path'

const FLAG = 'eas-update'

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    const furtherActions: string[] = []

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
      [
        'Remember to create repository secret EXPO_TOKEN for EAS Update workflow to work properly. For more information check',
        'https://github.com/software-mansion-labs/react-native-ci-cli?tab=readme-ov-file#-repository-secrets',
      ].join(' ')
    )
    furtherActions.push(
      `Create EXPO_TOKEN repository secret. More info at ${REPOSITORY_SECRETS_HELP_URL}`
    )

    return {
      flag: `--${FLAG}`,
      furtherActions,
    }
  }

const run = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<
  | ((
      toolbox: CycliToolbox,
      context: ProjectContext
    ) => Promise<ExecutorResult>)
  | null
> => {
  if (toolbox.skipInteractiveForRecipe(FLAG)) {
    context.selectedOptions.push(FLAG)
    return execute()
  }

  if (toolbox.skipInteractive()) {
    return null
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run EAS Update on your project on every PR?'
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
    description: 'Generate EAS Update and preview workflow to run on every PR',
  },
  run,
}

export default recipe
