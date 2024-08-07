import { CycliToolbox, ProjectContext } from '../types'
import { basename } from 'path'

module.exports = (toolbox: CycliToolbox) => {
  const generate = async (
    template: string,
    target: string,
    context: ProjectContext,
    props: Record<string, string> = {}
  ) => {
    const workflowString = await toolbox.template.generate({
      template,
      props: {
        packageManager: context.packageManager,
        pathRelativeToRoot: context.path.relFromRepoRoot(
          context.path.packageRoot
        ),
        ...props,
      },
    })

    toolbox.filesystem.write(target, workflowString.trimStart())

    toolbox.interactive.step(`Created ${basename(target)} workflow file.`)
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
