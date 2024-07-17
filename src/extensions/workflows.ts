import { GluegunToolbox } from 'gluegun'
import { ProjectContext } from '../types'
import { parse, stringify } from 'yaml'

module.exports = (toolbox: GluegunToolbox) => {
  const generate = async (
    template: string,
    target: string,
    context: ProjectContext,
    props: Record<string, string> = {}
  ) => {
    const workflowYml = parse(
      await toolbox.template.generate({
        template,
        props: {
          packageManager: context.packageManager,
          pathRelativeToRoot: context.getPathRelativeToRoot(),
          ...props,
        },
      })
    )

    toolbox.filesystem.write(target, stringify(workflowYml))
  }

  toolbox.workflows = { generate }
}
