import { CycliToolbox, ProjectContext } from '../types'
import { parse, stringify } from 'yaml'

module.exports = (toolbox: CycliToolbox) => {
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
          pathRelativeToRoot: context.path.relFromRepoRoot(
            context.path.packageRoot
          ),
          ...props,
        },
      })
    )

    toolbox.filesystem.write(target, stringify(workflowYml))
  }

  toolbox.workflows = { generate }
}

export interface WorkflowsExtension {
  workflows: {
    generate: (
      template: string,
      target: string,
      context: ProjectContext,
      props?: Record<string, string>
    ) => Promise<void>
  }
}
