import { REPOSITORY_SECRETS_HELP_URL } from '../constants'
import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'

const FLAG = 'eas-update'

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
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
    `Remember to create repository secret EXPO_TOKEN for EAS Update workflow to work properly. For more information check ${REPOSITORY_SECRETS_HELP_URL}`
  )
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'EAS Update and Preview',
    flag: FLAG,
    description:
      'Generate EAS Update and preview workflow to run on every PR (Expo projects only)',
  },
  execute,
}

export default recipe
