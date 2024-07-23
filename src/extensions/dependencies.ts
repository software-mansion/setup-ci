import { GluegunToolbox } from 'gluegun'
import { PackageManager } from '../types'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem, packageManager } = toolbox

  const exists = (name: string): boolean => {
    const packageJSON = filesystem.read('package.json', 'json')
    return !!packageJSON?.dependencies?.[name]
  }

  const existsDev = (name: string): boolean => {
    const packageJSON = filesystem.read('package.json', 'json')
    return !!packageJSON?.devDependencies?.[name]
  }

  const add = async (name: string, manager: PackageManager, dev = false) => {
    if ((dev && existsDev(name)) || (!dev && exists(name))) {
      toolbox.interactive.step(
        `Package ${name} already used, skipping adding dependency.`
      )
      return
    }

    if (dev && exists(name)) {
      toolbox.interactive.warning(
        `${name} is already in "dependencies", but shouldn't it be in "devDependencies"?`
      )
      return
    }

    if (!dev && existsDev(name)) {
      toolbox.interactive.warning(
        `Moving ${name} from "devDependencies" to "dependencies".`
      )

      const spinner = toolbox.interactive.spin(
        `🗑️ Removing ${name} from "devDependencies"...`
      )
      await packageManager.remove(name, { dev: true })
      spinner.stop()
    }

    const spinner = toolbox.interactive.spin(
      `📦 Installing ${name} as ${dev ? 'devDependency' : 'dependency'}...`
    )
    await packageManager.add(name, { dev, force: manager })
    spinner.stop()

    toolbox.interactive.step(`Installed ${name}.`)
  }

  toolbox.dependencies = {
    exists,
    existsDev,
    add,
  }
}
