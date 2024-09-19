import { COLORS, CYCLI_COMMAND, REPOSITORY_ISSUES_URL } from '../constants'
import { CycliToolbox } from '../types'
import { join, sep } from 'path'
import { messageFromError } from '../utils/errors'

module.exports = (toolbox: CycliToolbox) => {
  const { packageManager } = toolbox

  const exists = (name: string): boolean =>
    Boolean(toolbox.projectConfig.packageJson().dependencies?.[name])

  const existsDev = (name: string): boolean =>
    Boolean(toolbox.projectConfig.packageJson().devDependencies?.[name])

  const install = async (fullName: string, { dev }: { dev: boolean }) => {
    const type = dev ? 'devDependency' : 'dependency'

    const spinner = toolbox.interactive.spin(
      `📦 Installing ${fullName} as ${type}...`
    )

    try {
      await packageManager.add(fullName, {
        dev,
        force: toolbox.context.packageManager(),
      })
    } catch (error: unknown) {
      spinner.stop()

      const errorMessage = messageFromError(error)
      const logFilePath = `${sep}${join(
        'tmp',
        `setup-ci-error.${Date.now()}.log`
      )}`
      toolbox.filesystem.write(logFilePath, errorMessage)

      toolbox.interactive.vspace()
      await toolbox.interactive.actionPrompt(
        [
          `${CYCLI_COMMAND} was unable to add ${fullName} as ${type}.`,
          'This is most likely caused by conflicts with packages already installed in your project.',
          `${COLORS.underline(
            'Please add it manually'
          )}. You can do it now or after the script finishes.`,
          `You can find detailed logs in ${COLORS.underline(logFilePath)}.`,
          'If the error looks like a bug with the script itself, please file a report at',
          `${REPOSITORY_ISSUES_URL}.\n`,
        ].join('\n')
      )
      toolbox.interactive.vspace()

      toolbox.furtherActions.push(`Add ${fullName} as ${type} manually.`)
    }

    spinner.stop()

    toolbox.interactive.step(`Installed ${fullName} as ${type}.`)
  }

  const add = async (
    name: string,
    {
      version = '',
      skipInstalledCheck = false,
    }: { version?: string; skipInstalledCheck?: boolean } = {
      version: '',
      skipInstalledCheck: false,
    }
  ) => {
    if (!skipInstalledCheck && exists(name)) {
      toolbox.interactive.step(
        `Dependency ${name} is already installed, skipping adding dependency.`
      )
      return
    }

    const fullName = version ? [name, version].join('@') : name

    await install(fullName, { dev: false })
  }

  const addDev = async (
    name: string,
    {
      version = '',
      skipInstalledCheck = false,
    }: { version?: string; skipInstalledCheck?: boolean } = {
      version: '',
      skipInstalledCheck: false,
    }
  ) => {
    if (exists(name)) {
      toolbox.interactive.warning(
        `Detected package ${name} in "dependencies", but shouldn't it be in "devDependencies"?`
      )
      await add(name, { version, skipInstalledCheck })
      return
    }

    if (!skipInstalledCheck && existsDev(name)) {
      toolbox.interactive.step(
        `Dev dependency ${name} is already installed, skipping adding dependency.`
      )
      return
    }

    const fullName = version ? [name, version].join('@') : name

    await install(fullName, { dev: true })
  }

  toolbox.dependencies = {
    exists,
    existsDev,
    add,
    addDev,
  }
}

export interface DependenciesExtension {
  dependencies: {
    exists: (name: string) => boolean
    existsDev: (name: string) => boolean
    add: (
      name: string,
      options?: {
        version?: string
        skipInstalledCheck?: boolean
      }
    ) => Promise<void>
    addDev: (
      name: string,
      options?: {
        version?: string
        skipInstalledCheck?: boolean
      }
    ) => Promise<void>
  }
}
