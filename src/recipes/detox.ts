import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { confirm } from '@clack/prompts'
import { createBuildWorkflows } from './build'

const DETOX_EXPO_PLUGIN = '@config-plugins/detox'
const COMMAND = 'detox'

const executeExpoWorkflow = async (
  toolbox: Toolbox,
  expoConfigJSON: Record<string, any>
) => {
  toolbox.print.info('⚙️ Setting up app build for Detox.')

  await createBuildWorkflows(toolbox, expoConfigJSON)

  await toolbox.dependencies.add('detox', true)

  // @^29 because of https://wix.github.io/Detox/docs/introduction/project-setup#step-1-bootstrap
  await toolbox.dependencies.add('jest@^29', true)

  await toolbox.dependencies.add('ts-jest', true)
  await toolbox.dependencies.add('@types/jest', true)
  await toolbox.dependencies.add(DETOX_EXPO_PLUGIN, true)

  const availableExpoPlugins = expoConfigJSON.expo.plugins

  if (!availableExpoPlugins.includes('detox')) {
    await toolbox.patching.update('app.json', (config) => {
      if (!(config?.expo?.plugins ?? []).includes(DETOX_EXPO_PLUGIN)) {
        config.expo.plugins.push(DETOX_EXPO_PLUGIN)
      }

      return config
    })

    toolbox.print.info('✔ Added Detox Expo Plugin to app.json')
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

  const iOSAppName = expoConfigJSON?.expo?.name.replaceAll('-', '')

  await toolbox.template.generate({
    template: 'detox/.detoxrc.js.ejs',
    target: `.detoxrc.js`,
    props: {
      iOSAppName: iOSAppName,
    },
  })

  await toolbox.template.generate({
    template: 'detox/jest.config.js.ejs',
    target: `e2e/jest.config.js`,
  })

  await toolbox.template.generate({
    template: 'detox/starter.test.ts.ejs',
    target: `e2e/starter.test.ts`,
  })

  await toolbox.template.generate({
    template: 'detox/test-detox-android.ejf',
    target: `.github/workflows/test-detox-android.yml`,
  })

  await toolbox.template.generate({
    template: 'detox/test-detox-ios.ejf',
    target: `.github/workflows/test-detox-ios.yml`,
  })

  toolbox.print.warning(
    '⚠️  Remember to edit example test in e2e/starter.test.ts to match your app.'
  )

  toolbox.print.info('✔ Created Detox workflow for Expo.')
}

const execute = () => async (toolbox: Toolbox) => {
  // TODO: Obtaining app.json should be moved to context. To do after merging to up to date changes.
  const expoConfigJSON = toolbox.filesystem.read('app.json', 'json')

  if (expoConfigJSON) {
    await executeExpoWorkflow(toolbox, expoConfigJSON)
  } else {
    // Detox for React Native
  }

  return `--${COMMAND}`
}

const run = async (
  toolbox: Toolbox
): Promise<(toolbox: Toolbox) => Promise<string> | null> => {
  if (toolbox.skipInteractiveForCommand(COMMAND)) {
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
