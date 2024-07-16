import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { confirm } from '@clack/prompts'

import { executeExpoWorkflow as executeExpoBuildWorkflow } from './buildDebug' // TODO: Temporary solution

const COMMAND = 'detox'

const DETOX_EXPO_PLUGIN = '@config-plugins/detox'

const executeExpoWorkflow = async (
  toolbox: Toolbox,
  expoConfigJSON: Record<string, any>
) => {
  toolbox.print.info('⚙️  Setting up app build for Detox.')

  await executeExpoBuildWorkflow(toolbox, expoConfigJSON)

  await toolbox.dependencies.add('detox', true)
  await toolbox.dependencies.add('jest@^29', true) // @^29 because of https://wix.github.io/Detox/docs/introduction/project-setup#step-1-bootstrap
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
    'detox:setup:android',
    'npx expo prebuild && yarn detox build --configuration android.emu.debug'
  )

  await toolbox.scripts.add(
    'detox:setup:ios',
    'npx expo prebuild && (cd ios/ && pod install) && yarn detox build --configuration ios.sim.debug'
  )

  await toolbox.scripts.add(
    'detox:test:android',
    'yarn detox test --configuration android.emu.debug'
  )

  await toolbox.scripts.add(
    'detox:test:ios',
    'yarn detox test --configuration ios.sim.debug'
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
    template: 'detox/test-e2e-android.ejf',
    target: `.github/workflows/test-e2e-android.yml`,
  })

  await toolbox.template.generate({
    template: 'detox/test-e2e-ios.ejf',
    target: `.github/workflows/test-e2e-ios.yml`,
  })

  toolbox.print.warning(
    '⚠️  Remember to edit example test in e2e/starter.test.ts to match your app.'
  )

  toolbox.print.info('✔ Created Detox workflow for Expo.')
}

const execute = () => async (toolbox: Toolbox) => {
  const expoConfigJSON = toolbox.filesystem.read('app.json', 'json')

  // if (!packageJSON?.devDependencies?.eslint) {
  //   const spinner = toolbox.print.spin('Installing ESLint...')

  //   await toolbox.packageManager.add('eslint', { dev: true })

  //   spinner.stop()

  //   toolbox.print.info('Installed ESLint.')
  // }

  // await toolbox.patching.update('package.json', (config) => {
  //   if (!config.scripts.lint) {
  //     config.scripts.lint = 'eslint "**/*.{js,jsx,ts,tsx}"'

  //     toolbox.print.info('Added ESLint script to package.json')
  //   }

  //   return config
  // })

  // await toolbox.template.generate({
  //   template: 'lint.ejf',
  //   target: `.github/workflows/lint.yml`,
  // })

  // toolbox.print.info('Created ESLint workflow.')

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
    message: 'Do you want to run Detox e2e test on every PR?',
  })

  if (!proceed) {
    return
  }

  return execute()
}

export default run
