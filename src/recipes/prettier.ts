import {
  CycliRecipe,
  CycliToolbox,
  ExecutorResult,
  ProjectContext,
} from '../types'
import { join } from 'path'

export const FLAG = 'prettier'

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    const furtherActions: string[] = []

    await toolbox.dependencies.addDev('prettier', context)

    furtherActions.push(
      ...(await toolbox.scripts.add(
        'prettier:check',
        'prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
      ))
    )

    furtherActions.push(
      ...(await toolbox.scripts.add(
        'prettier:write',
        'prettier --write "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
      ))
    )

    await toolbox.workflows.generate(join('prettier', 'prettier.ejf'), context)

    if (!toolbox.filesystem.exists('.prettierrc')) {
      await toolbox.template.generate({
        template: join('prettier', '.prettierrc.ejs'),
        target: '.prettierrc',
      })

      toolbox.interactive.step(
        'Created default .prettierrc configuration file.'
      )
    }

    if (!toolbox.filesystem.exists('.prettierignore')) {
      await toolbox.template.generate({
        template: join('prettier', '.prettierignore.ejs'),
        target: '.prettierignore',
      })

      toolbox.interactive.step('Created default .prettierignore file.')
    }

    toolbox.interactive.step('Created Prettier check workflow.')

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
  if (toolbox.options.isRecipeSelected(FLAG)) {
    context.selectedOptions.push(FLAG)
    return execute()
  }

  if (toolbox.options.isPreset()) {
    return null
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run Prettier check on your project on every PR?'
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
    description: 'Generate Prettier check workflow to run on every PR',
  },
  run,
}

export default recipe
