import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const { patching } = toolbox

  const add = async (name: string, command: string) => {
    await patching.update('package.json', (config) => {
      if (config.scripts[name]) {
        toolbox.interactive.warning(
          `Skipping attempt to add script "${name}": "${command}" to package.json as script ${name} already exists.`
        )
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
