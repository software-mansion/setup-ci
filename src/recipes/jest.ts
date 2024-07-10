import { Toolbox } from 'gluegun/build/types/domain/toolbox'

const COMMAND = 'jest'

const execute = () => async (toolbox: Toolbox) => {
  await toolbox.dependencies.add('jest', true)

  await toolbox.scripts.add('test', 'jest')

  const manager = toolbox.dependencies.manager()

  await toolbox.template.generate({
    template: `${manager}/jest.ejf`,
    target: `.github/workflows/jest.yml`,
  })

  toolbox.print.info('✔ Created Jest workflow.')

  return `--${COMMAND}`
}

const run = async (
  toolbox: Toolbox
): Promise<(toolbox: Toolbox) => Promise<string> | null> => {
  if (toolbox.skipInteractiveForCommand(COMMAND)) {
    return execute()
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run Jest on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  return execute()
}

export default run
