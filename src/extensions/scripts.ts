import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const { patching } = toolbox

  const add = async (name: string, command: string) => {
    await patching.update('package.json', (config) => {
      if (config.scripts[name]) {
        return config
      }

      config.scripts[name] = command

      toolbox.interactive.step(
        `Added script "${name}": "${command}" to package.json.`
      )

      return config
    })
  }

  toolbox.scripts = { add }
}
