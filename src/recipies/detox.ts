import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { confirm } from '@clack/prompts'

const COMMAND = 'detox'

const DETOX_EXPO_PLUGIN = '@config-plugins/detox'

const executeExpoWorkflow = async (
  toolbox: Toolbox,
  expoConfigJSON: Record<string, any>
) => {
  const packageJSON = toolbox.filesystem.read('package.json', 'json')

  if (!packageJSON?.devDependencies?.detox) {
    const spinner = toolbox.print.spin('Installing Detox...')

    await toolbox.packageManager.add('detox', { dev: true })

    spinner.stop()

    toolbox.print.info('Installed Detox.')
  }

  if (!packageJSON?.devDependencies?.jest) {
    const spinner = toolbox.print.spin('Installing Jest...')

    await toolbox.packageManager.add('jest', { dev: true })

    spinner.stop()

    toolbox.print.info('Installed Jest.')
  }

  if (!packageJSON?.devDependencies?.[DETOX_EXPO_PLUGIN]) {
    const spinner = toolbox.print.spin('Installing Expo Plugin for Detox...')

    await toolbox.packageManager.add(DETOX_EXPO_PLUGIN, { dev: true })

    spinner.stop()

    toolbox.print.info('Installed Detox Expo Plugin.')
  }

  const availableExpoPlugins = expoConfigJSON.expo.plugins

  if (!availableExpoPlugins.includes('detox')) {
    await toolbox.patching.update('app.json', (config) => {
      config.expo.plugins.push(DETOX_EXPO_PLUGIN)

      return config
    })

    toolbox.print.info('Added Detox Expo Plugin to app.json')
  }

  const iOSAppName = expoConfigJSON?.expo?.name.replaceAll('-', '')

  // console.log("iOSAppName", iOSAppName)

  await toolbox.template.generate({
    template: '.detoxrc.js.ejs',
    target: `.detoxrc.js`,
    props: {
      iOSAppName: iOSAppName,
    },
  })

  toolbox.print.info('Created Detox workflow for Expo.')
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

  const proceed = await confirm({
    message: 'Do you want to run Detox e2e test on every PR?',
  })

  if (!proceed) {
    return
  }

  return execute()
}

export default run
