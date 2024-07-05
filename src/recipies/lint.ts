import { Toolbox } from 'gluegun/build/types/domain/toolbox'

const COMMAND = 'lint'

const execute = () => async (toolbox: Toolbox) => {
  await toolbox.dependencies.add('eslint', '', true)

  await toolbox.scripts.add('lint', 'eslint "**/*.{js,jsx,ts,tsx}"')

  await toolbox.template.generate({
    template: 'lint.ejf',
    target: `.github/workflows/lint.yml`,
  })

  toolbox.print.info('✔ Created ESLint workflow.')

  return `--${COMMAND}`
}

const run = async (
  toolbox: Toolbox
): Promise<(toolbox: Toolbox) => Promise<string> | null> => {
  const { confirm } = await import('@clack/prompts')

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
