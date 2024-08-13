import {
  CycliRecipe,
  CycliToolbox,
  ExecutorResult,
  ProjectContext,
} from '../types'
import { join } from 'path'

const FLAG = 'ts'

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    const furtherActions: string[] = []

    await toolbox.dependencies.addDev('typescript', context)

    furtherActions.push(
      ...(await toolbox.scripts.add('ts:check', 'tsc -p . --noEmit'))
    )

    await toolbox.workflows.generate(
      join('typescript', 'typescript.ejf'),
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

    return { flag: `--${FLAG}`, furtherActions }
  }

const run = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<
  | ((
      toolbox: CycliToolbox,
      context: ProjectContext
    ) => Promise<ExecutorResult>)
  | null
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
    return null
  }

  context.selectedOptions.push(FLAG)
  return execute()
}

export const recipe: CycliRecipe = {
  meta: {
    flag: FLAG,
    description: 'Generate Typescript check workflow to run on every PR',
  },
  run,
}

export default recipe
