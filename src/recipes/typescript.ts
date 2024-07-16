import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { ProjectContext } from '../types'
import { parse, stringify } from 'yaml'
import { relative } from 'path'

const COMMAND = 'typescript'

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  await toolbox.dependencies.add('typescript', context.packageManager, true)

  await toolbox.scripts.add('compile', 'tsc -p .')

  const workflowYml = parse(
    await toolbox.template.generate({
      template: 'typescript.ejf',
      props: {
        ...context,
        pathRelativeToRoot:
          relative(context.repoRoot, context.packageRoot) || '.',
      },
    })
  )

  toolbox.filesystem.write(
    toolbox.filesystem.path(
      context.repoRoot,
      '.github',
      'workflows',
      'typescript.yml'
    ),
    stringify(workflowYml)
  )

  toolbox.print.info('✔ Created Typescript workflow.')

  return `--${COMMAND}`
}

const run = async (
  toolbox: Toolbox
): Promise<
  (toolbox: Toolbox, context: ProjectContext) => Promise<string> | null
> => {
  if (toolbox.skipInteractiveForCommand(COMMAND)) {
    return execute()
  }

  const proceed = await toolbox.interactive.confirm(
    'Do you want to run Typescript on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  return execute()
}

export default run
