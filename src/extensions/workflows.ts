import { CycliToolbox } from '../types'
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
    props: Record<string, string> = {}
  ): Promise<string> => {
    const pathRelativeToRoot = toolbox.context.path.relFromRepoRoot(
      toolbox.context.path.packageRoot()
    )

    const packageManager = toolbox.context.packageManager()
    const isMonorepo = toolbox.context.isMonorepo()

    const nodeVersionFile =
      packageManager !== 'bun'
        ? toolbox.context.path.relFromRepoRoot(
            toolbox.projectConfig.nodeVersionFile()
          )
        : undefined

    const bunVersionFile =
      packageManager === 'bun'
        ? toolbox.context.path.relFromRepoRoot(
            toolbox.projectConfig.bunVersionFile()
          )
        : undefined

    const workflowString = await toolbox.template.generate({
      template,
      props: {
        isMonorepo,
        packageManager,
        nodeVersionFile,
        bunVersionFile,
        pathRelativeToRoot,
        ...props,
      },
    })

    const workflowFileName = getWorkflowFileName(template, pathRelativeToRoot)
    const target = toolbox.context.path.absFromRepoRoot(
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
      props?: Record<string, string>
    ) => Promise<string>
  }
}
