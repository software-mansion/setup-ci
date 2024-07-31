import { GluegunToolbox } from 'gluegun'
import { ProjectContext } from '../types'
import { join } from 'path'

const FLAG = 'prettier'

const execute =
  () => async (toolbox: GluegunToolbox, context: ProjectContext) => {
    await toolbox.dependencies.add('prettier', context.packageManager, true)

    await toolbox.scripts.add(
      'prettier:check',
      'prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
    )

    await toolbox.workflows.generate(
      join('prettier', 'prettier.ejf'),
      context.path.absFromRepoRoot('.github', 'workflows', 'prettier.yml'),
      context
    )

    if (!toolbox.filesystem.exists('.prettierrc')) {
      await toolbox.template.generate({
        template: join('prettier', '.prettierrc.ejs'),
        target: '.prettierrc',
      })

      toolbox.interactive.step(
        'Created default .prettierrc configuration file.'
      )
    }

    if (!toolbox.filesystem.exists('.prettierignore')) {
      await toolbox.template.generate({
        template: join('prettier', '.prettierignore.ejs'),
        target: '.prettierignore',
      })

      toolbox.interactive.step('Created default .prettierignore file.')
    }

    toolbox.interactive.step('Created Prettier check workflow.')

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
    'Do you want to run Prettier check on your project on every PR?'
  )

  if (!proceed) {
    return null
  }

  return execute()
}

export default run
