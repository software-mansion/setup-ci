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

const generateConfigForBareReactNative = async (
  toolbox: CycliToolbox,
  context: ProjectContext,
  withPrettier: boolean
): Promise<void> => {
  await toolbox.dependencies.addDev('@react-native/eslint-config', context)
  await toolbox.dependencies.addDev('eslint-plugin-ft-flow', context)

  await toolbox.template.generate({
    template: join('lint', '.eslintrc.json.ejs'),
    target: '.eslintrc.json',
    props: {
      withPrettier,
    },
  })

  toolbox.interactive.step('Created .eslintrc.json with default configuration.')
}

const generateConfigForExpo = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  await toolbox.dependencies.addDev('eslint-config-expo', context)

  await toolbox.template.generate({
    template: join('lint', '.eslintrc-expo.json.ejs'),
    target: '.eslintrc.json',
  })

  toolbox.interactive.step(
    'Created .eslintrc.json with Expo specific configuration.'
  )
}

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
  // user wants to use configuration from https://docs.expo.dev/guides/using-eslint/.
  const isEslintConfigExpoInstalled =
    toolbox.dependencies.existsDev('eslint-config-expo') ||
    toolbox.dependencies.exists('eslint-config-expo')

  if (!existsEslintConfiguration(toolbox)) {
    const generateExpoSpecificConfig =
      isEslintConfigExpoInstalled || toolbox.projectConfig.isExpo()

    if (generateExpoSpecificConfig) {
      await generateConfigForExpo(toolbox, context)
    } else {
      await generateConfigForBareReactNative(toolbox, context, withPrettier)
    }
  }

  await toolbox.scripts.add('lint', "eslint '**/*.{js,jsx,ts,tsx}'")

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
