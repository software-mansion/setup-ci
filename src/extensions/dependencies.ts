import { GluegunToolbox } from 'gluegun'

export type PackageManager = 'yarn' | 'npm'

const lockFileToManager: Map<string, PackageManager> = new Map([
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
])

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem, packageManager, print } = toolbox

  const detectManager = (): PackageManager => {
    const lockFiles = filesystem
      .list()
      .filter((fileName) => lockFileToManager.has(fileName))

    if (lockFiles.length == 0) {
      return null
    }

    if (lockFiles.length > 1) {
      toolbox.print.warning(
        `Detected more than one lock file in current directory.`
      )
    }

    return lockFileToManager.get(lockFiles[0])
  }

  const manager = (): PackageManager => {
    if (toolbox.dependencies.currentManager === undefined) {
      toolbox.dependencies.currentManager = detectManager()
    }

    return toolbox.dependencies.currentManager
  }

  const exists = (name: string, dev: boolean) => {
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
    manager,
  }
}
