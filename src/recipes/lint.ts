import { CycliRecipe, CycliRecipeType, CycliToolbox } from '../types'
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

const generateConfigForBareReactNative = async (
  toolbox: CycliToolbox,
  withPrettier: boolean
): Promise<void> => {
  await toolbox.dependencies.addDev('@react-native/eslint-config')
  await toolbox.dependencies.addDev('eslint-plugin-ft-flow')

  await toolbox.template.generate({
    template: join('lint', '.eslintrc.json.ejs'),
    target: '.eslintrc.json',
    props: {
      withPrettier,
    },
  })

  toolbox.interactive.step('Created .eslintrc.json with default configuration.')
}

const generateConfigForExpo = async (toolbox: CycliToolbox): Promise<void> => {
  await toolbox.dependencies.addDev('eslint-config-expo')

  await toolbox.template.generate({
    template: join('lint', '.eslintrc-expo.json.ejs'),
    target: '.eslintrc.json',
  })

  toolbox.interactive.step(
    'Created .eslintrc.json with Expo specific configuration.'
  )
}

const execute = async (toolbox: CycliToolbox): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating ESLint workflow')

  // eslint@9 introduces new configuration format that is not supported by widely used plugins yet,
  // so we stick to ^8 for now.
  await toolbox.dependencies.addDev('eslint', { version: '^8' })
  await toolbox.dependencies.addDev('typescript')

  const withPrettier =
    toolbox.config.getSelectedRecipes().includes(CycliRecipeType.PRETTIER) ||
    toolbox.dependencies.existsDev('prettier') ||
    toolbox.dependencies.exists('prettier')

  if (withPrettier) {
    await toolbox.dependencies.addDev('eslint-plugin-prettier')
    await toolbox.dependencies.addDev('eslint-config-prettier')
  }

  // We assume that if eslint-config-expo is present in package.json,
  // user wants to use configuration from https://docs.expo.dev/guides/using-eslint/.
  const isEslintConfigExpoInstalled =
    toolbox.dependencies.existsDev('eslint-config-expo') ||
    toolbox.dependencies.exists('eslint-config-expo')

  if (!existsEslintConfiguration(toolbox)) {
    const generateExpoSpecificConfig =
      isEslintConfigExpoInstalled || toolbox.projectConfig.isExpo()

    if (generateExpoSpecificConfig) {
      await generateConfigForExpo(toolbox)
    } else {
      await generateConfigForBareReactNative(toolbox, withPrettier)
    }
  }

  await toolbox.scripts.add('lint', "eslint '**/*.{js,jsx,ts,tsx}'")

  await toolbox.workflows.generate(join('lint', 'lint.ejf'))

  toolbox.interactive.success('Created ESLint workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'ESLint',
    flag: CycliRecipeType.ESLINT,
    description: 'Generate ESLint workflow to run on every PR',
    selectHint: 'check code style with linter',
  },
  execute,
}

export default recipe
