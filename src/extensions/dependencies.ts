import { CycliToolbox, ProjectContext } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const { packageManager } = toolbox

  const exists = (name: string): boolean =>
    Boolean(toolbox.projectConfig.packageJson().dependencies?.[name])

  const existsDev = (name: string): boolean =>
    Boolean(toolbox.projectConfig.packageJson().devDependencies?.[name])

  const add = async (
    name: string,
    context: ProjectContext,
    version = '',
    skipInstalledCheck = false
  ) => {
    const fullName = version ? [name, version].join('@') : name

    if (!skipInstalledCheck && exists(name)) {
      toolbox.interactive.step(
        `Dependency ${name} is already installed, skipping adding dependency.`
      )
      return
    }

    const spinner = toolbox.interactive.spin(
      `📦 Installing ${fullName} as dependency...`
    )
    await packageManager.add(fullName, {
      dev: false,
      force: context.packageManager,
    })
    spinner.stop()

    toolbox.interactive.step(`Installed ${fullName} as dependency.`)
  }

  const addDev = async (
    name: string,
    context: ProjectContext,
    version = '',
    skipInstalledCheck = false
  ) => {
    if (exists(name)) {
      toolbox.interactive.warning(
        `Detected package ${name} in "dependencies", but shouldn't it be in "devDependencies"?`
      )
      add(name, context, version, skipInstalledCheck)
      return
    }

    const fullName = version ? [name, version].join('@') : name

    if (!skipInstalledCheck && existsDev(name)) {
      toolbox.interactive.step(
        `Dev dependency ${name} is already installed, skipping adding dependency.`
      )
    } else {
      const spinner = toolbox.interactive.spin(
        `📦 Installing ${fullName} as devDependency...`
      )
      await packageManager.add(fullName, {
        dev: true,
        force: context.packageManager,
      })
      spinner.stop()
    }

    toolbox.interactive.step(`Installed ${fullName} as devDependency.`)
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
      context: ProjectContext,
      version?: string,
      skipInstalledCheck?: boolean
    ) => Promise<void>
    addDev: (
      name: string,
      context: ProjectContext,
      version?: string,
      skipInstalledCheck?: boolean
    ) => Promise<void>
  }
}
