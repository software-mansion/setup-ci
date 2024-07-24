import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { ProjectContext } from '../types'
import { join } from 'path'

const FLAG = 'lint'

const ESLINT_CONFIGURATION_FILES = [
  '.eslintrc.js',
  '.eslintrc.json',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
]

const existsEslintConfigurationFile = (toolbox: Toolbox): boolean =>
  toolbox.filesystem
    .list()
    .filter((f) => ESLINT_CONFIGURATION_FILES.includes(f)).length > 0

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  // eslint@9.x introduces new configuration format that is not supported by widely used plugins yet.
  // https://eslint.org/docs/latest/use/migrate-to-9.0.0
  await toolbox.dependencies.add('eslint@^8', context.packageManager, true)

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
  toolbox: Toolbox
): Promise<
  (toolbox: Toolbox, context: ProjectContext) => Promise<string> | null
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
    return
  }

  return execute()
}

export default run
