import { GluegunToolbox } from 'gluegun'
import { ProjectContext } from '../types'

module.exports = (toolbox: GluegunToolbox) => {
  const { packageManager, semver } = toolbox

  const getSemver = (
    name: string,
    context: ProjectContext
  ): string | undefined => {
    return context.packageJson.dependencies?.[name]
  }

  const getSemverDev = (
    name: string,
    context: ProjectContext
  ): string | undefined => {
    return context.packageJson.devDependencies?.[name]
  }

  const exists = (name: string, context: ProjectContext): boolean =>
    !!getSemver(name, context)

  const existsDev = (name: string, context: ProjectContext): boolean =>
    !!getSemverDev(name, context)

  const isSatisfied = (
    name: string,
    version: string,
    context: ProjectContext
  ): boolean => {
    const currentVersion = getSemver(name, context)
    return (
      !!currentVersion &&
      (version === '' || semver.satisfies(currentVersion, version))
    )
  }

  const isSatisfiedDev = (
    name: string,
    version: string,
    context: ProjectContext
  ): boolean => {
    const currentVersion = getSemverDev(name, context)
    return (
      !!currentVersion &&
      (version === '' || semver.satisfies(currentVersion, version))
    )
  }

  const add = async (name: string, context: ProjectContext, version = '') => {
    if (existsDev(name, context)) {
      toolbox.interactive.warning(
        `Moving ${name} from "devDependencies" to "dependencies".`
      )

      const spinner = toolbox.interactive.spin(
        `🗑️ Removing ${name} from "devDependencies"...`
      )
      await packageManager.remove(name, { dev: true })
      spinner.stop()
    }

    const fullName = version ? [name, version].join('@') : name

    if (isSatisfied(name, version, context)) {
      toolbox.interactive.step(
        `Dependency ${fullName} is already satisfied, skipping adding dependency.`
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
    version = ''
  ) => {
    if (exists(name, context)) {
      toolbox.interactive.warning(
        `Detected package ${name} in "dependencies", but shouldn't it be in "devDependencies"?`
      )
      add(name, context, version)
      return
    }

    const fullName = version ? [name, version].join('@') : name

    if (isSatisfiedDev(name, version, context)) {
      toolbox.interactive.step(
        `Dev dependency ${fullName} is already satisfied, skipping adding dependency.`
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
    isSatisfied,
    isSatisfiedDev,
    exists,
    existsDev,
    add,
    addDev,
  }
}

export interface DependenciesExtension {
  dependencies: {
    exists: (name: string, context: ProjectContext) => boolean
    existsDev: (name: string, context: ProjectContext) => boolean
    add: (
      name: string,
      context: ProjectContext,
      version?: string
    ) => Promise<void>
    addDev: (
      name: string,
      context: ProjectContext,
      version?: string
    ) => Promise<void>
  }
}
