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

  const formatWorkflowString = (workflowString: string): string => {
    return workflowString
      .trimStart() // Remove white characters from beginning
      .replace(/\n([ ]*\n[ ]*)+\n/g, '\n\n') // Replace >=3 consecutive empty lines (possibly containing spaces) with two endlines
  }

  const generate = async (
    template: string,
    context: ProjectContext,
    props: Record<string, string> = {}
  ): Promise<string> => {
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

    toolbox.filesystem.write(target, formatWorkflowString(workflowString))

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
