import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { ProjectContext } from '../types'
import { parse, stringify } from 'yaml'
import { relative } from 'path'

const COMMAND = 'jest'

const execute = () => async (toolbox: Toolbox, context: ProjectContext) => {
  await toolbox.dependencies.add('jest', context.packageManager, true)

  await toolbox.scripts.add('test', 'jest')

  const workflowYml = parse(
    await toolbox.template.generate({
      template: 'jest.ejf',
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
      'jest.yml'
    ),
    stringify(workflowYml)
  )

  toolbox.print.info('✔ Created Jest workflow.')

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
    'Do you want to run Jest on your project on every PR?'
  )

  if (!proceed) {
    return
  }

  return execute()
}

export default run
