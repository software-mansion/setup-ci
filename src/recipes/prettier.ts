import { CycliRecipe, CycliToolbox, ProjectContext, RunResult } from '../types'
import { join } from 'path'

export const FLAG = 'prettier'

const PRETTIER_CONFIGURATION_FILES = ['.prettierrc', 'prettier.config.js']

const existsPrettierConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().prettier) ||
  Boolean(
    toolbox.filesystem
      .list()
      ?.some((f) => PRETTIER_CONFIGURATION_FILES.includes(f))
  )

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    toolbox.interactive.vspace()
    toolbox.interactive.sectionHeader('Genereating Prettier check workflow')

    await toolbox.dependencies.addDev('prettier', context)

    await toolbox.scripts.add(
      'prettier:check',
      'prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
    )

    await toolbox.scripts.add(
      'prettier:write',
      'prettier --write "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
    )

    await toolbox.workflows.generate(join('prettier', 'prettier.ejf'), context)

    if (!existsPrettierConfiguration(toolbox)) {
      await toolbox.template.generate({
        template: join('prettier', '.prettierrc.ejs'),
        target: '.prettierrc',
      })

      toolbox.interactive.step(
        'Created default .prettierrc configuration file.'
      )

      await toolbox.template.generate({
        template: join('prettier', '.prettierignore.ejs'),
        target: '.prettierignore',
      })

      toolbox.interactive.step('Created default .prettierignore file.')
    }

    toolbox.interactive.success('Created Prettier check workflow.')

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
    'Do you want to run Prettier check on every PR?',
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
    description: 'Generate Prettier check workflow to run on every PR',
  },
  run,
}

export default recipe
