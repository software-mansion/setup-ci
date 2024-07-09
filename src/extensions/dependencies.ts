import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem, packageManager, print } = toolbox

  const exists = (name: string, dev = false) => {
    const packageJSON = filesystem.read('package.json', 'json')
    return (
      (!dev && packageJSON?.dependencies?.[name]) ||
      (dev && packageJSON?.devDependencies?.[name])
    )
  }

  const add = async (name: string, dev = false) => {
    if (exists(name, dev)) {
      print.info(`${name} already installed, skipping adding dependency.`)
      return
    }

    if (dev && exists(name, !dev)) {
      toolbox.print.warning(
        `${name} is already in "dependencies", but shouldn't it be in "devDependencies"?`
      )
      return
    }

    if (!dev && exists(name, !dev)) {
      toolbox.print.warning(
        `Moving ${name} from "devDependencies" to "dependencies".`
      )

      const spinner = print.spin(
        `🗑️ Removing ${name} from "devDependencies"...`
      )
      await packageManager.remove(name, { dev: true })
      spinner.stop()
    }

    const spinner = print.spin(
      `📦 Installing ${name} as ${dev ? 'devDependency' : 'dependency'}...`
    )
    await packageManager.add(name, { dev })
    spinner.stop()

    print.info(`✔ Installed ${name}.`)
  }

  toolbox.dependencies = {
    exists,
    add,
  }
}
