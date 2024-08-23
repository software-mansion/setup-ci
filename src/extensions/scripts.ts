import { CycliToolbox } from '../types'
import { COLORS } from '../constants'

module.exports = (toolbox: CycliToolbox) => {
  const { patching } = toolbox
  const { underline } = COLORS

  const add = async (name: string, command: string): Promise<void> => {
    await patching.update('package.json', (config) => {
      if (config.scripts[name]) {
        if (config.scripts[name] === command) {
          return config
        }

        toolbox.interactive.warning(
          [
            `Skipping attempt to add script ${underline(
              `"${name}": "${command}"`
            )} to package.json as script "${underline(name)}" already exists.`,
            'Consider updating it to make generated workflows work properly.',
          ].join(' ')
        )

        toolbox.furtherActions.push(
          `Consider updating script "${underline(name)}" to "${underline(
            command
          )}" in package.json to make generated workflows work properly.`
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
