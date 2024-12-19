import {
  CycliRecipe,
  CycliRecipeType,
  CycliToolbox,
  WorkflowEvent,
  WorkflowEventType,
} from '../types'
import { join } from 'path'

const configureProject = async (toolbox: CycliToolbox): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Configuring project for Typescript check')

  await toolbox.dependencies.addDev('typescript')

  await toolbox.scripts.add('ts:check', 'tsc -p . --noEmit')

  if (!toolbox.filesystem.exists('tsconfig.json')) {
    await toolbox.template.generate({
      template: join('typescript', 'tsconfig.json.ejs'),
      target: 'tsconfig.json',
    })

    toolbox.interactive.step(
      'Created tsconfig.json with default configuration.'
    )
  }

  toolbox.interactive.success('Configured project for Typescript check.')
}

const generateWorkflow = async (
  toolbox: CycliToolbox,
  events: WorkflowEvent[]
): Promise<void> => {
  await toolbox.workflows.generate(join('typescript', 'typescript.ejf'), {
    events,
  })

  toolbox.interactive.success(
    `Created Typescript check workflow for events: [${events
      .map((e) => e.type)
      .join(', ')}]`
  )
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'TS check',
    flag: CycliRecipeType.TYPESCRIPT,
    description: 'Generate Typescript check workflow to run on every PR',
    selectHint: 'run typescript check to find compilation errors',
    allowedEvents: [WorkflowEventType.PUSH, WorkflowEventType.PULL_REQUEST],
  },
  configureProject,
  generateWorkflow,
}

export default recipe
