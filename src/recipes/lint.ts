import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { ProjectContext } from '../types'

const COMMAND = 'lint'

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  await toolbox.dependencies.add('eslint', true)

  await toolbox.scripts.add('lint', 'eslint "**/*.{js,jsx,ts,tsx}"')

  await toolbox.template.generate({
    template: 'lint.ejf',
    target: `.github/workflows/lint.yml`,
    props: { ...context },
  })

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

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run ESLint on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  return execute()
}

export default run
