import { CycliRecipe, CycliRecipeFlag, CycliToolbox } from '../types'
import { join } from 'path'

const existsPrettierConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().prettier) ||
  Boolean(
    toolbox.filesystem
      .list()
      ?.some(
        (f) => f.startsWith('.prettierrc') || f.startsWith('prettier.config.')
      )
  )

const execute = async (toolbox: CycliToolbox): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating Prettier check workflow')

  await toolbox.dependencies.addDev('prettier')

  await toolbox.scripts.add(
    'prettier:check',
    'prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
  )

  await toolbox.scripts.add(
    'prettier:write',
    'prettier --write "**/*.{ts,tsx,js,jsx,json,css,scss,md}"'
  )

  await toolbox.workflows.generate(join('prettier', 'prettier.ejf'))

  if (!existsPrettierConfiguration(toolbox)) {
    await toolbox.template.generate({
      template: join('prettier', '.prettierrc.ejs'),
      target: '.prettierrc',
    })

    toolbox.interactive.step('Created default .prettierrc configuration file.')

    await toolbox.template.generate({
      template: join('prettier', '.prettierignore.ejs'),
      target: '.prettierignore',
    })

    toolbox.interactive.step('Created default .prettierignore file.')
  }

  toolbox.interactive.success('Created Prettier check workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Prettier',
    flag: CycliRecipeFlag.PRETTIER,
    description: 'Generate Prettier check workflow to run on every PR',
    selectHint: 'check code format with prettier',
  },
  execute,
}

export default recipe
