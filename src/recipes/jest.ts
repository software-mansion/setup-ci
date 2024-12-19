import { join } from 'path'
import {
  CycliRecipe,
  CycliRecipeType,
  CycliToolbox,
  WorkflowEvent,
  WorkflowEventType,
} from '../types'

const existsJestConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().jest) ||
  Boolean(toolbox.filesystem.list()?.some((f) => f.startsWith('jest.config.')))

const configureProject = async (toolbox: CycliToolbox): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Configuring project for Jest')

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

  toolbox.interactive.success('Configured project for Jest.')
}

const generateWorkflow = async (
  toolbox: CycliToolbox,
  events: WorkflowEvent[]
): Promise<void> => {
  await toolbox.workflows.generate(join('jest', 'jest.ejf'), { events })

  toolbox.interactive.success(
    `Created Jest workflow for events: [${events
      .map((e) => e.type)
      .join(', ')}]`
  )
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Jest',
    flag: CycliRecipeType.JEST,
    description: 'Generate Jest workflow to run on every PR',
    selectHint: 'run tests with Jest',
    allowedEvents: [WorkflowEventType.PUSH, WorkflowEventType.PULL_REQUEST],
  },
  configureProject,
  generateWorkflow,
}

export default recipe
