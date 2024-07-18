import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { ProjectContext } from '../types'

const COMMAND = 'typescript'

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  await toolbox.dependencies.add('typescript', context.packageManager, true)

  await toolbox.scripts.add('compile', 'tsc -p .')

  await toolbox.workflows.generate(
    'typescript.ejf',
    context.path.absFromRepoRoot('.github', 'workflows', 'typescript.yml')
  )

  toolbox.print.info('✔ Created Typescript workflow.')

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
    'Do you want to run Typescript on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  return execute()
}

export default run
