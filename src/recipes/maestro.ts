import {
  CycliRecipe,
  CycliRecipeType,
  CycliToolbox,
  WorkflowEvent,
  WorkflowEventType,
} from '../types'
import { configureProjectForBuild, generateBuildWorkflows } from './build'
import { join } from 'path'

const configureProject = async (toolbox: CycliToolbox) => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Configuring project for Maestro')

  await configureProjectForBuild(toolbox, { mode: 'debug' })

  await toolbox.scripts.add(
    'maestro:test',
    'maestro test --debug-output maestro-debug-output .maestro'
  )

  if (!toolbox.filesystem.exists('.maestro')) {
    const appId = toolbox.projectConfig.getAppId()
    const isExpo = toolbox.projectConfig.isExpo()

    await toolbox.template.generate({
      template: join('maestro', 'example-flow.ejf'),
      target: join('.maestro', 'example-flow.yml'),
      props: {
        appId: appId || 'insert.your.app.id.here',
        isExpo,
      },
    })

    toolbox.interactive.step(
      'Initialized .maestro/ directory with example maestro flow.'
    )

    const exampleFlowMessage =
      'Remember to edit .maestro/example-flow.yml to match your app.'

    toolbox.interactive.success('Configured project for Maestro.')

    toolbox.interactive.warning(exampleFlowMessage)
    toolbox.furtherActions.push(exampleFlowMessage)
  }
}

const generateWorkflow = async (
  toolbox: CycliToolbox,
  events: WorkflowEvent[]
) => {
  const {
    android: androidDebugBuildWorkflowFileName,
    ios: iOSDebugBuildWorkflowFileName,
  } = await generateBuildWorkflows(toolbox, { mode: 'debug', events })

  await toolbox.workflows.generate(
    join('maestro', 'maestro-test-android.ejf'),
    { events },
    {
      androidDebugBuildWorkflowFileName,
    }
  )

  await toolbox.workflows.generate(
    join('maestro', 'maestro-test-ios.ejf'),
    { events },
    {
      iOSDebugBuildWorkflowFileName,
    }
  )

  toolbox.interactive.success(
    `Created Maestro workflow for events: [${events
      .map((e) => e.type)
      .join(', ')}]`
  )
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Maestro',
    flag: CycliRecipeType.MAESTRO,
    description: 'Generate workflow to run Maestro e2e tests on every PR',
    selectHint: 'run maestro e2e tests suite',
    allowedEvents: [WorkflowEventType.PUSH, WorkflowEventType.PULL_REQUEST],
  },
  configureProject,
  generateWorkflow,
} as const

export default recipe
