import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'
import { FLAG as PRETTIER_FLAG } from './prettier'

const FLAG = 'lint'

const existsEslintConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(toolbox.projectConfig.packageJson().eslintConfig) ||
  Boolean(
    toolbox.filesystem
      .list()
      ?.some(
        (f) => f.startsWith('.eslintrc.') || f.startsWith('eslint.config.')
      )
  )

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating ESLint workflow')

  // eslint@9 introduces new configuration format that is not supported by widely used plugins yet,
  // so we stick to ^8 for now.
  await toolbox.dependencies.addDev('eslint', context, { version: '^8' })
  await toolbox.dependencies.addDev('typescript', context)

  const withPrettier =
    context.selectedOptions.includes(PRETTIER_FLAG) ||
    toolbox.dependencies.existsDev('prettier') ||
    toolbox.dependencies.exists('prettier')

  if (withPrettier) {
    await toolbox.dependencies.addDev('eslint-plugin-prettier', context)
    await toolbox.dependencies.addDev('eslint-config-prettier', context)
  }

  // We assume that if eslint-config-expo is present in package.json,
  // ESLint is already configured using https://docs.expo.dev/guides/using-eslint/.
  // Therefore we don't need to add @react-native/eslint-config, script nor configuration.
  const isEslintConfiguredWithExpo =
    toolbox.dependencies.existsDev('eslint-config-expo') ||
    toolbox.dependencies.exists('eslint-config-expo')

  if (!isEslintConfiguredWithExpo) {
    await toolbox.dependencies.addDev('@react-native/eslint-config', context)

    await toolbox.scripts.add('lint', "eslint '**/*.{js,jsx,ts,tsx}'")

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
  }

  await toolbox.workflows.generate(join('lint', 'lint.ejf'), context)

  toolbox.interactive.success('Created ESLint workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'ESLint',
    flag: FLAG,
    description: 'Generate ESLint workflow to run on every PR',
    selectHint: 'check code style with linter',
  },
  execute,
}

export default recipe
