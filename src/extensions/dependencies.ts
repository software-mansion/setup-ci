import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem, packageManager, print } = toolbox

  const exists = (name: string, dev: boolean) => {
    const packageJSON = filesystem.read('package.json', 'json')
    return (
      (!dev && packageJSON?.dependencies?.[name]) ||
      (dev && packageJSON?.devDependencies?.[name])
    )
  }

  const add = async (name: string, dev: boolean) => {
    if (exists(name, dev)) {
      print.info(`${name} already installed, skipping adding dependency.`)
      return
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
