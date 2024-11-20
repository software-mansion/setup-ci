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
  ): Promise<string> => {
    const pathRelativeToRoot = context.path.relFromRepoRoot(
      context.path.packageRoot
    )

    const isMonorepo = pathRelativeToRoot !== '.'

    const nodeVersionFile =
      context.packageManager !== 'bun'
        ? context.path.relFromRepoRoot(
            toolbox.projectConfig.nodeVersionFile(context)
          )
        : undefined

    const bunVersionFile =
      context.packageManager === 'bun'
        ? context.path.relFromRepoRoot(
            toolbox.projectConfig.bunVersionFile(context)
          )
        : undefined

    const workflowString = await toolbox.template.generate({
      template,
      props: {
        isMonorepo,
        packageManager: context.packageManager,
        nodeVersionFile,
        bunVersionFile,
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

    if (toolbox.filesystem.exists(target)) {
      toolbox.interactive.warning(
        `Workflow file ${workflowFileName} already exists and will be overwritten.`
      )
    }

    toolbox.filesystem.write(target, workflowString)

    toolbox.interactive.step(`Created ${workflowFileName} workflow file.`)

    return workflowFileName
  }

  toolbox.workflows = { generate }
}

export interface WorkflowsExtension {
  workflows: {
    generate: (
      template: string,
      context: ProjectContext,
      props?: Record<string, string>
    ) => Promise<string>
  }
}
