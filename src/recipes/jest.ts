import { join } from 'path'
import { CycliRecipe, CycliRecipeFlag, CycliToolbox } from '../types'

const existsJestConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().jest) ||
  Boolean(toolbox.filesystem.list()?.some((f) => f.startsWith('jest.config.')))

const execute = async (toolbox: CycliToolbox): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating Jest workflow')

  await toolbox.dependencies.addDev('jest')

  await toolbox.scripts.add('test', 'jest --passWithNoTests')

  if (!existsJestConfiguration(toolbox)) {
    await toolbox.template.generate({
      template: join('jest', 'jest.config.json.ejs'),
      target: 'jest.config.json',
    })

    toolbox.interactive.step(
      'Created jest.config.json with default configuration.'
    )
  }

  await toolbox.workflows.generate(join('jest', 'jest.ejf'))

  toolbox.interactive.success('Created Jest workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Jest',
    flag: CycliRecipeFlag.JEST,
    description: 'Generate Jest workflow to run on every PR',
    selectHint: 'run tests with Jest',
  },
  execute,
}

export default recipe
