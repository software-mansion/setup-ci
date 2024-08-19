import { REPOSITORY_SECRETS_HELP_URL } from '../constants'
import { CycliRecipe, CycliToolbox, ProjectContext, RunResult } from '../types'
import { createReleaseBuildWorkflowsForExpo } from './build-release'
import { join } from 'path'

const DETOX_EXPO_PLUGIN = '@config-plugins/detox'
const FLAG = 'detox'

const createDetoxWorkflowsForExpo = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<string[]> => {
  toolbox.interactive.info('⚙️ Setting up app release build for Detox.')

  const furtherActions: string[] = []

  furtherActions.push(
    ...(await createReleaseBuildWorkflowsForExpo(toolbox, context, [
      'android',
      'ios',
    ]))
  )

  await toolbox.dependencies.addDev('detox', context)
  // >=29 because of https://wix.github.io/Detox/docs/introduction/project-setup#step-1-bootstrap
  await toolbox.dependencies.addDev('jest', context, {
    version: '">=29"',
    skipInstalledCheck: true,
  })
  await toolbox.dependencies.addDev('ts-jest', context)
  await toolbox.dependencies.addDev('@types/jest', context)
  await toolbox.dependencies.addDev(DETOX_EXPO_PLUGIN, context)

  const currentExpoPlugins =
    toolbox.projectConfig.appJson()?.expo?.plugins || []

  if (!currentExpoPlugins.includes(DETOX_EXPO_PLUGIN)) {
    await toolbox.patching.update('app.json', (config) => {
      if (!config.expo.plugins) {
        config.expo.plugins = []
      }

      if (!config.expo.plugins.includes(DETOX_EXPO_PLUGIN)) {
        config.expo.plugins.push(DETOX_EXPO_PLUGIN)
      }

      return config
    })

    toolbox.interactive.step(`Added ${DETOX_EXPO_PLUGIN} plugin to app.json`)
  }

  furtherActions.push(
    ...(await toolbox.scripts.add(
      'detox:test:android',
      'detox test --config-path .detoxrc-ci.js --configuration android.emu.release --cleanup'
    ))
  )

  furtherActions.push(
    ...(await toolbox.scripts.add(
      'detox:test:ios',
      'detox test --config-path .detoxrc-ci.js --configuration ios.sim.release --cleanup'
    ))
  )

  await toolbox.template.generate({
    template: join('detox', '.detoxrc-ci.js.ejs'),
    target: `.detoxrc-ci.js`,
  })

  toolbox.interactive.step('Created .detoxrc-ci.js configuration file.')

  if (!toolbox.filesystem.exists('e2e')) {
    await toolbox.template.generate({
      template: join('detox', 'jest.config.js.ejs'),
      target: join('e2e', 'jest.config.js'),
    })

    await toolbox.template.generate({
      template: join('detox', 'starter.test.ts.ejs'),
      target: join('e2e', 'starter.test.ts'),
    })

    toolbox.interactive.step(
      'Initialized e2e/ directory with default detox jest configuration.'
    )

    const jestConfigMessage =
      'Consider adding "modulePathIgnorePatterns": ["e2e"] to your jest config.'
    toolbox.interactive.warning(jestConfigMessage)
    furtherActions.push(jestConfigMessage)

    const starterTestMessage =
      'Remember to edit example test in e2e/starter.test.ts to match your app.'
    toolbox.interactive.warning(starterTestMessage)
    furtherActions.push(starterTestMessage)
  }

  await toolbox.workflows.generate(
    join('detox', 'test-detox-android.ejf'),
    context
  )

  await toolbox.workflows.generate(join('detox', 'test-detox-ios.ejf'), context)

  toolbox.interactive.step('Created Detox workflow for Expo.')

  toolbox.interactive.warning(
    `Remember to create GH_TOKEN repository secret to make Detox workflow work. For more information check ${REPOSITORY_SECRETS_HELP_URL}`
  )
  furtherActions.push(
    `Create GH_TOKEN repository secret. More info at ${REPOSITORY_SECRETS_HELP_URL}`
  )

  return furtherActions
}

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    let furtherActions: string[] = []

    if (toolbox.projectConfig.appJson()?.expo) {
      furtherActions = await createDetoxWorkflowsForExpo(toolbox, context)
    } else {
      toolbox.interactive.error(
        'Detox workflows generation is currently not supported for non-expo projects. Skipping detox recipe.'
      )
    }

    return {
      flag: `--${FLAG}`,
      furtherActions,
    }
  }

const run = async (toolbox: CycliToolbox): Promise<RunResult> => {
  if (toolbox.options.isRecipeSelected(FLAG)) {
    return execute()
  }

  if (toolbox.options.isPreset()) {
    return null
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run Detox e2e tests on every PR?'
  )

  if (!proceed) {
    return null
  }

  return execute()
}

export const recipe: CycliRecipe = {
  meta: {
    flag: FLAG,
    description: 'Generate workflow to run Detox e2e tests on every PR',
  },
  run,
} as const

export default recipe
