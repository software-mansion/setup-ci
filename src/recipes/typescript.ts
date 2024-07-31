import { CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'

const FLAG = 'ts'

const execute =
  () => async (toolbox: CycliToolbox, context: ProjectContext) => {
    await toolbox.dependencies.addDev('typescript', context)

    await toolbox.scripts.add('ts:check', 'tsc -p . --noEmit')

    await toolbox.workflows.generate(
      join('typescript', 'typescript.ejf'),
      context.path.absFromRepoRoot(
        '.github',
        'workflows',
        `${context.packageJson.name}-typescript.yml`
      ),
      context
    )

    if (!toolbox.filesystem.exists('tsconfig.json')) {
      await toolbox.template.generate({
        template: join('typescript', 'tsconfig.json.ejs'),
        target: 'tsconfig.json',
      })

      toolbox.interactive.step(
        'Created tsconfig.json with default configuration.'
      )
    }

    toolbox.interactive.step('Created Typescript check workflow.')

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
    'Do you want to run Typescript on your project on every PR?'
  )

  if (!proceed) {
    return null
  }

  return execute()
}

export default run
