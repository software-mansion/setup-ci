import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { createBuildWorkflows } from './build'
import { join } from 'path'

const FLAG = 'maestro'

const execute = async (toolbox: CycliToolbox, context: ProjectContext) => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Genereating Maestro workflow')

  const expo = toolbox.projectConfig.isExpo()

  const {
    android: androidDebugBuildWorkflowFileName,
    ios: iOSDebugBuildWorkflowFileName,
  } = await createBuildWorkflows(toolbox, context, {
    mode: 'debug',
    expo,
  })

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

    toolbox.interactive.warning(exampleFlowMessage)
    toolbox.furtherActions.push(exampleFlowMessage)
  }

  await toolbox.workflows.generate(
    join('maestro', 'maestro-test-android.ejf'),
    context,
    {
      androidDebugBuildWorkflowFileName,
    }
  )

  await toolbox.workflows.generate(
    join('maestro', 'maestro-test-ios.ejf'),
    context,
    {
      iOSDebugBuildWorkflowFileName,
    }
  )

  toolbox.interactive.success('Created Maestro workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Maestro',
    flag: FLAG,
    description: 'Generate workflow to run Maestro e2e tests on every PR',
    selectHint: 'run maestro e2e tests suite',
  },
  execute,
} as const

export default recipe
