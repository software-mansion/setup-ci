import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { ProjectContext } from '../types'
import { parse, stringify } from 'yaml'

const COMMAND = 'lint'

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  await toolbox.dependencies.add('eslint', true)

  await toolbox.scripts.add('lint', 'eslint "**/*.{js,jsx,ts,tsx}"')

  const workflowYml = parse(
    await toolbox.template.generate({
      template: 'lint.ejf',
      props: { ...context },
    })
  )

  toolbox.filesystem.write('.github/workflows/lint.yml', stringify(workflowYml))

  toolbox.print.info('✔ Created ESLint workflow.')

  return `--${COMMAND}`
}

const run = async (
  toolbox: Toolbox
): Promise<
  (toolbox: Toolbox, context: ProjectContext) => Promise<string> | null
> => {
  if (toolbox.skipInteractiveForCommand(COMMAND)) {
    return execute()
  }

  if (toolbox.skipInteractive()) {
    return null
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run ESLint on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  return execute()
}

export default run
