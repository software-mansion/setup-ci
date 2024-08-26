import { join } from 'path'
import { CycliRecipe, CycliToolbox, ProjectContext, RunResult } from '../types'

const FLAG = 'jest'

const existsJestConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().jest) ||
  Boolean(toolbox.filesystem.list()?.some((f) => f.includes('jest.config.')))

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    toolbox.interactive.vspace()
    toolbox.interactive.sectionHeader('Genereating Jest workflow')

    await toolbox.dependencies.addDev('jest', context)

    await toolbox.scripts.add('test', 'jest')

    if (!existsJestConfiguration(toolbox)) {
      await toolbox.template.generate({
        template: join('jest', 'jest.config.json.ejs'),
        target: 'jest.config.json',
      })

      toolbox.interactive.step(
        'Created jest.config.json with default configuration.'
      )
    }

    await toolbox.workflows.generate(join('jest', 'jest.ejf'), context)

    toolbox.interactive.success('Created Jest workflow.')

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
    'Do you want to run Jest on your project on every PR?',
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
    description: 'Generate Jest workflow to run on every PR',
  },
  run,
}

export default recipe
