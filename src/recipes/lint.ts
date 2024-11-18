import { CycliRecipe, CycliRecipeFlag, CycliToolbox } from '../types'
import { join } from 'path'

const existsEslintConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().eslintConfig) ||
  Boolean(
    toolbox.filesystem
      .list()
      ?.some(
        (f) => f.startsWith('.eslintrc.') || f.startsWith('eslint.config.')
      )
  )

const execute = async (toolbox: CycliToolbox): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating ESLint workflow')

  // eslint@9 introduces new configuration format that is not supported by widely used plugins yet,
  // so we stick to ^8 for now.
  await toolbox.dependencies.addDev('eslint', { version: '^8' })
  await toolbox.dependencies.addDev('typescript')
  await toolbox.dependencies.addDev('@react-native/eslint-config')

  const withPrettier =
    toolbox.config.selectedRecipes().includes(CycliRecipeFlag.PRETTIER) ||
    toolbox.dependencies.existsDev('prettier') ||
    toolbox.dependencies.exists('prettier')

  if (withPrettier) {
    await toolbox.dependencies.addDev('eslint-plugin-prettier')
    await toolbox.dependencies.addDev('eslint-config-prettier')
  }

  await toolbox.scripts.add('lint', 'eslint "**/*.{js,jsx,ts,tsx}"')

  if (!existsEslintConfiguration(toolbox)) {
    await toolbox.template.generate({
      template: join('lint', '.eslintrc.json.ejs'),
      target: '.eslintrc.json',
      props: {
        withPrettier,
      },
    })

    toolbox.interactive.step(
      'Created .eslintrc.json with default configuration.'
    )
  }

  await toolbox.workflows.generate(join('lint', 'lint.ejf'))

  toolbox.interactive.success('Created ESLint workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'ESLint',
    flag: CycliRecipeFlag.ESLINT,
    description: 'Generate ESLint workflow to run on every PR',
    selectHint: 'check code style with linter',
  },
  execute,
}

export default recipe
