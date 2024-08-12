import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'

const FLAG = 'jest'

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  await toolbox.dependencies.addDev('jest', context)

  await toolbox.scripts.add('test', 'jest')

  await toolbox.workflows.generate('jest.ejf', context)

  toolbox.interactive.step('Created Jest workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Jest',
    flag: FLAG,
    description: 'Generate Jest workflow to run on every PR',
  },
  execute,
}

export default recipe
