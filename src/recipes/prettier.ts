import {
  CycliRecipe,
  CycliRecipeType,
  CycliToolbox,
  WorkflowEvent,
  WorkflowEventType,
} from '../types'
import { join } from 'path'

const existsPrettierConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().prettier) ||
  Boolean(
    toolbox.filesystem
      .list()
      ?.some(
        (f) => f.startsWith('.prettierrc') || f.startsWith('prettier.config.')
      )
  )

const configureProject = async (toolbox: CycliToolbox): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Configuring project for Prettier check')

  await toolbox.dependencies.addDev('prettier')

  await toolbox.scripts.add(
    'prettier:check',
    'prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
  )

  await toolbox.scripts.add(
    'prettier:write',
    'prettier --write "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
  )

  if (!existsPrettierConfiguration(toolbox)) {
    await toolbox.template.generate({
      template: join('prettier', '.prettierrc.ejs'),
      target: '.prettierrc',
    })

    toolbox.interactive.step('Created default .prettierrc configuration file.')

    await toolbox.template.generate({
      template: join('prettier', '.prettierignore.ejs'),
      target: '.prettierignore',
    })

    toolbox.interactive.step('Created default .prettierignore file.')
  }

  toolbox.interactive.success('Configured project for Prettier check.')
}

const generateWorkflow = async (
  toolbox: CycliToolbox,
  events: WorkflowEvent[]
): Promise<void> => {
  await toolbox.workflows.generate(join('prettier', 'prettier.ejf'), { events })

  toolbox.interactive.success(
    `Created Prettier check workflow for events: [${events
      .map((e) => e.type)
      .join(', ')}]`
  )
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Prettier',
    flag: CycliRecipeType.PRETTIER,
    description: 'Generate Prettier check workflow to run on every PR',
    selectHint: 'check code format with prettier',
    allowedEvents: [WorkflowEventType.PUSH, WorkflowEventType.PULL_REQUEST],
  },
  configureProject,
  generateWorkflow,
}

export default recipe
