import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { confirm } from '@clack/prompts'
import { ProjectContext } from '../types'
import { createDebugBuildWorkflowsForExpo } from './build-debug'
import { createReleaseBuildWorkflowsForExpo } from './build-release'
import { join } from 'path'

const DETOX_EXPO_PLUGIN = '@config-plugins/detox'
const FLAG = 'detox'

const createDetoxWorkflowsForExpo = async (
  toolbox: Toolbox,
  context: ProjectContext
) => {
  toolbox.interactive.info('⚙️ Setting up app build for Detox.')

  await createDebugBuildWorkflowsForExpo(toolbox, context, ['android'])
  await createReleaseBuildWorkflowsForExpo(toolbox, context, ['ios'])

  await toolbox.dependencies.add('detox', context.packageManager, true)
  // @^29 because of https://wix.github.io/Detox/docs/introduction/project-setup#step-1-bootstrap
  await toolbox.dependencies.add('jest@^29', context.packageManager, true)
  await toolbox.dependencies.add('ts-jest', context.packageManager, true)
  await toolbox.dependencies.add('@types/jest', context.packageManager, true)
  await toolbox.dependencies.add(
    DETOX_EXPO_PLUGIN,
    context.packageManager,
    true
  )

  const availableExpoPlugins = context.expoConfigJson.expo.plugins

  if (!availableExpoPlugins.includes('detox')) {
    await toolbox.patching.update('app.json', (config) => {
      // TODO: These ? seem useless (next line they are ommited).
      if (!(config?.expo?.plugins ?? []).includes(DETOX_EXPO_PLUGIN)) {
        config.expo.plugins.push(DETOX_EXPO_PLUGIN)
      }
      return config
    })

    toolbox.interactive.step('Added Detox Expo Plugin to app.json')
  }

  await toolbox.scripts.add(
    'detox:test:android',
    'detox test --configuration android.emu.debug'
  )

  await toolbox.scripts.add(
    'detox:test:ios',
    'detox test --configuration ios.sim.release --cleanup'
  )

  await toolbox.scripts.add('prebuild:clean', 'rm -rf ios/ android/')

  await toolbox.template.generate({
    template: join('detox', '.detoxrc.js.ejs'),
    target: `.detoxrc.js`,
    props: {
      iOSAppName: context.iOsAppName,
    },
  })

  await toolbox.template.generate({
    template: join('detox', 'jest.config.js.ejs'),
    target: join('e2e', 'jest.config.js'),
  })

  await toolbox.template.generate({
    template: join('detox', 'starter.test.ts.ejs'),
    target: join('e2e', 'starter.test.ts'),
  })

  await toolbox.workflows.generate(
    join('detox', 'test-detox-android.ejf'),
    context.path.absFromRepoRoot(
      '.github',
      'workflows',
      'test-detox-android.yml'
    ),
    context
  )

  await toolbox.workflows.generate(
    join('detox', 'test-detox-ios.ejf'),
    context.path.absFromRepoRoot('.github', 'workflows', 'test-detox-ios.yml'),
    context
  )

  toolbox.interactive.warning(
    'Remember to edit example test in e2e/starter.test.ts to match your app.'
  )

  toolbox.interactive.step('Created Detox workflow for Expo.')
}

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  if (context.expoConfigJson?.expo) {
    await createDetoxWorkflowsForExpo(toolbox, context)
  } else {
    // TODO: Detox for React Native
  }

  return `--${FLAG}`
}

const run = async (
  toolbox: Toolbox
): Promise<
  (toolbox: Toolbox, context: ProjectContext) => Promise<string> | null
> => {
  if (toolbox.skipInteractiveForRecipe(FLAG)) {
    return execute()
  }

  if (toolbox.skipInteractive()) {
    return null
  }

  const proceed = await confirm({
    message: 'Do you want to run Detox tests on every PR?',
  })

  if (!proceed) {
    return
  }

  return execute()
}

export default run
