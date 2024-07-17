import { GluegunToolbox } from 'gluegun'
import { ProjectContext } from '../types'
import { parse, stringify } from 'yaml'

module.exports = (toolbox: GluegunToolbox) => {
  const generate = async (
    template: string,
    target: string,
    context: ProjectContext
  ) => {
    const workflowYml = parse(
      await toolbox.template.generate({
        template,
        props: {
          ...context,
          pathRelativeToRoot: context.getPathRelativeToRoot(),
        },
      })
    )

    toolbox.filesystem.write(target, stringify(workflowYml))
  }

  toolbox.workflows = { generate }
}
