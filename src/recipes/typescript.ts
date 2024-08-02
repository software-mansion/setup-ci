import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { CycliRecipe, ProjectContext } from '../types'
import { join } from 'path'

const FLAG = 'ts'

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  await toolbox.dependencies.add('typescript', context.packageManager, true)

  await toolbox.scripts.add('ts:check', 'tsc -p . --noEmit')

  await toolbox.workflows.generate(
    join('typescript', 'typescript.ejf'),
    context.path.absFromRepoRoot('.github', 'workflows', 'typescript.yml'),
    context
  )

  if (!toolbox.filesystem.exists('tsconfig.json')) {
    await toolbox.template.generate({
      template: join('typescript', 'tsconfig.json.ejs'),
      target: 'tsconfig.json',
    })

    toolbox.interactive.step(
      'Created tsconfig.json with default configuration.'
    )
  }

  toolbox.interactive.step('Created Typescript check workflow.')

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
    'Do you want to run Typescript on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  context.selectedOptions.push(FLAG)
  return execute()
}

export const recipe: CycliRecipe = {
  option: {
    flag: FLAG,
    description: 'Generate Typescript check workflow to run on every PR',
  },
  run,
}

export default recipe
