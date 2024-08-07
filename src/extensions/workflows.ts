import { CycliToolbox, ProjectContext } from '../types'
import { basename } from 'path'

module.exports = (toolbox: CycliToolbox) => {
  const getWorkflowFileName = (
    template: string,
    pathRelativeToRoot: string
  ): string => {
    const workflowBasename = basename(template, '.ejf')

    if (pathRelativeToRoot === '.') {
      return `${workflowBasename}.yml`
    }

    return `${toolbox.projectConfig.getName()}-${workflowBasename}.yml`
  }

  const generate = async (
    template: string,
    context: ProjectContext,
    props: Record<string, string> = {}
  ) => {
    const pathRelativeToRoot = context.path.relFromRepoRoot(
      context.path.packageRoot
    )

    const workflowString = await toolbox.template.generate({
      template,
      props: {
        packageManager: context.packageManager,
        pathRelativeToRoot,
        ...props,
      },
    })

    const workflowFileName = getWorkflowFileName(template, pathRelativeToRoot)
    const target = context.path.absFromRepoRoot(
      '.github',
      'workflows',
      workflowFileName
    )

    toolbox.filesystem.write(target, workflowString.trimStart())

    toolbox.interactive.step(`Created ${workflowFileName} workflow file.`)
  }

  toolbox.workflows = { generate }
}

export interface WorkflowsExtension {
  workflows: {
    generate: (
      template: string,
      context: ProjectContext,
      props?: Record<string, string>
    ) => Promise<void>
  }
}
