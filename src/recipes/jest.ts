import { join } from 'path'
import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'

const FLAG = 'jest'

const existsJestConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().jest) ||
  Boolean(toolbox.filesystem.list()?.some((f) => f.includes('jest.config.')))

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
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

  toolbox.interactive.step('Created Jest workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Jest',
    flag: FLAG,
    description: 'Generate Jest workflow to run on every PR',
    selectHint: 'test your program with jest',
  },
  execute,
}

export default recipe
