import { GluegunToolbox } from 'gluegun'
import { ProjectContext } from '../types'
import { join } from 'path'

const FLAG = 'eas-update'

const execute =
  () => async (toolbox: GluegunToolbox, context: ProjectContext) => {
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

    await toolbox.workflows.generate(
      join('eas', 'eas-update.ejf'),
      context.path.absFromRepoRoot('.github', 'workflows', 'eas-update.yml'),
      context
    )

    toolbox.interactive.step('Created EAS Update workflow.')

    toolbox.interactive.warning(
      [
        'Remember to create repository secret EXPO_TOKEN for EAS Update workflow to work properly.',
        'Learn more at https://docs.expo.dev/eas-update/github-actions',
      ].join(' ')
    )

    return `--${FLAG}`
  }

const run = async (
  toolbox: GluegunToolbox
): Promise<
  ((toolbox: GluegunToolbox, context: ProjectContext) => Promise<string>) | null
> => {
  if (toolbox.skipInteractiveForRecipe(FLAG)) {
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

  return execute()
}

export default run
