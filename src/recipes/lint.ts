import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'
import { FLAG as PRETTIER_FLAG } from './prettier'

const FLAG = 'lint'

const ESLINT_CONFIGURATION_FILES = [
  '.eslintrc.js',
  '.eslintrc.json',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
]

const existsEslintConfigurationFile = (toolbox: CycliToolbox): boolean =>
  Boolean(
    toolbox.filesystem
      .list()
      ?.some((f) => ESLINT_CONFIGURATION_FILES.includes(f))
  )

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  // eslint@9 introduces new configuration format that is not supported by widely used plugins yet,
  // so we stick to ^8 for now.
  await toolbox.dependencies.addDev('eslint', context, { version: '^8' })

  const withPrettier =
    context.selectedOptions.includes(PRETTIER_FLAG) ||
    toolbox.dependencies.existsDev('prettier') ||
    toolbox.dependencies.exists('prettier')

  if (withPrettier) {
    await toolbox.dependencies.addDev('eslint-plugin-prettier', context)

    await toolbox.dependencies.addDev('eslint-config-prettier', context)
  }

  await toolbox.scripts.add('lint', 'eslint "**/*.{js,jsx,ts,tsx}"')

  if (!existsEslintConfigurationFile(toolbox)) {
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

  await toolbox.workflows.generate(join('lint', 'lint.ejf'), context)

  toolbox.interactive.step('Created ESLint workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'ESLint',
    flag: FLAG,
    description: 'Generate ESLint workflow to run on every PR',
  },
  execute,
}

export default recipe
