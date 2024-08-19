import { CycliToolbox } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const { patching } = toolbox

  const add = async (name: string, command: string): Promise<void> => {
    await patching.update('package.json', (config) => {
      if (config.scripts[name]) {
        toolbox.interactive.warning(
          [
            `Skipping attempt to add script "${name}": "${command}" to package.json as script ${name} already exists.`,
            `Consider updating it to make generated workflows work properly.`,
          ].join(' ')
        )

        toolbox.furtherActions.push(
          `Consider updating script "${name}" in package.json to "${command}".`
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

export interface ScriptsExtension {
  scripts: {
    add: (name: string, command: string) => Promise<void>
  }
}
