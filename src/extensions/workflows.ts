import { CycliToolbox, WorkflowEventType, WorkflowEvent } from '../types'
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

  const eventsToWorkflowProps = (
    events: WorkflowEvent[]
  ): Record<string, string> => {
    const props: Record<string, string> = {}

    events.forEach((event: WorkflowEvent) => {
      switch (event.type) {
        case WorkflowEventType.PUSH:
          props.push = event.branch ?? ''
          break
        case WorkflowEventType.PULL_REQUEST:
          props.pull_request = 'true'
          break
      }
    })

    return props
  }

  const generate = async (
    template: string,
    { events }: { events: WorkflowEvent[] },
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
        ...eventsToWorkflowProps(events),
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
      { events }: { events: WorkflowEvent[] },
      props?: Record<string, string>
    ) => Promise<string>
  }
}
