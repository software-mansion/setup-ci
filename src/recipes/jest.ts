import { CycliRecipe, CycliToolbox, ProjectContext, RunResult } from '../types'

const FLAG = 'jest'

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    await toolbox.dependencies.addDev('jest', context)

    await toolbox.scripts.add('test', 'jest')

    await toolbox.workflows.generate('jest.ejf', context)

    toolbox.interactive.step('Created Jest workflow.')

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
    'Do you want to run Jest on your project on every PR?'
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
