import { CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'

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
      ?.some((f: string) => ESLINT_CONFIGURATION_FILES.includes(f))
  )

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    if (
      !toolbox.dependencies.exists('eslint', context) &&
      !toolbox.dependencies.existsDev('eslint', context)
    ) {
      // eslint@9 introduces new configuration format that is not supported by widely used plugins yet,
      // so we stick to ^8 for now.
      await toolbox.dependencies.addDev('eslint', context, '^8')
    }

    await toolbox.scripts.add('lint', 'eslint "**/*.{js,jsx,ts,tsx}"')

    if (!existsEslintConfigurationFile(toolbox)) {
      await toolbox.template.generate({
        template: join('lint', '.eslintrc.json.ejs'),
        target: '.eslintrc.json',
      })

      toolbox.interactive.step(
        'Created .eslintrc.json with default configuration.'
      )
    }

    await toolbox.workflows.generate(
      join('lint', 'lint.ejf'),
      context.path.absFromRepoRoot('.github', 'workflows', 'lint.yml'),
      context
    )

    toolbox.interactive.step('Created ESLint workflow.')

    return `--${FLAG}`
  }

const run = async (
  toolbox: CycliToolbox
): Promise<
  ((toolbox: CycliToolbox, context: ProjectContext) => Promise<string>) | null
> => {
  if (toolbox.skipInteractiveForRecipe(FLAG)) {
    return execute()
  }

  if (toolbox.skipInteractive()) {
    return null
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run ESLint on your project on every PR?'
  )

  if (!proceed) {
    return null
  }

  return execute()
}

export default run
