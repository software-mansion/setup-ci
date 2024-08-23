import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'

export const FLAG = 'prettier'

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  await toolbox.dependencies.addDev('prettier', context)

  await toolbox.scripts.add(
    'prettier:check',
    'prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
  )

  await toolbox.scripts.add(
    'prettier:write',
    'prettier --write "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
  )

  await toolbox.workflows.generate(join('prettier', 'prettier.ejf'), context)

  if (!toolbox.filesystem.exists('.prettierrc')) {
    await toolbox.template.generate({
      template: join('prettier', '.prettierrc.ejs'),
      target: '.prettierrc',
    })

    toolbox.interactive.step('Created default .prettierrc configuration file.')
  }

  if (!toolbox.filesystem.exists('.prettierignore')) {
    await toolbox.template.generate({
      template: join('prettier', '.prettierignore.ejs'),
      target: '.prettierignore',
    })

    toolbox.interactive.step('Created default .prettierignore file.')
  }

  toolbox.interactive.step('Created Prettier check workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Prettier',
    flag: FLAG,
    description: 'Generate Prettier check workflow to run on every PR',
    selectHint: 'check your code format with prettier',
  },
  execute,
}

export default recipe
