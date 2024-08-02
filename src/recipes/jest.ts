import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { ProjectContext } from '../types'

const FLAG = 'jest'

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  await toolbox.dependencies.add('jest', context.packageManager, true)

  await toolbox.scripts.add('test', 'jest')

  await toolbox.workflows.generate(
    'jest.ejf',
    context.path.absFromRepoRoot('.github', 'workflows', 'jest.yml'),
    context
  )

  toolbox.interactive.step('Created Jest workflow.')

  return `--${FLAG}`
}

const run = async (
  toolbox: Toolbox,
  context: ProjectContext
): Promise<
  (toolbox: Toolbox, context: ProjectContext) => Promise<string> | null
> => {
  if (toolbox.skipInteractiveForRecipe(FLAG)) {
    context.selectedOptions.push(FLAG)
    return execute()
  }

  if (toolbox.skipInteractive()) {
    return null
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run Jest on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  context.selectedOptions.push(FLAG)
  return execute()
}

export default run
