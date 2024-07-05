import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { confirm } from '@clack/prompts'

const COMMAND = 'lint'

const execute = () => async (toolbox: Toolbox) => {
  const packageJSON = toolbox.filesystem.read('package.json', 'json')

  if (!packageJSON?.devDependencies?.eslint) {
    const spinner = toolbox.print.spin('Installing ESLint...')

    await toolbox.packageManager.add('eslint', { dev: true })

    spinner.stop()

    toolbox.print.info('Installed ESLint.')
  }

  await toolbox.patching.update('package.json', (config) => {
    if (!config.scripts.lint) {
      config.scripts.lint = 'eslint "**/*.{js,jsx,ts,tsx}"'

      toolbox.print.info('Added ESLint script to package.json')
    }

    return config
  })

  await toolbox.template.generate({
    template: 'lint.ejf',
    target: `.github/workflows/lint.yml`,
  })

  toolbox.print.info('Created ESLint workflow.')

  return `--${COMMAND}`
}

const run = async (
  toolbox: Toolbox
): Promise<(toolbox: Toolbox) => Promise<string> | null> => {
  if (toolbox.skipInteractiveForCommand(COMMAND)) {
    return execute()
  }

  const proceed = await confirm({
    message: 'Do you want to run ESLint on your project on every PR?',
  })

  if (!proceed) {
    return
  }

  return execute()
}

export default run
