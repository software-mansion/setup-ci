import { GluegunToolbox } from 'gluegun'
import { HelpCommand } from './help'
import { CycliCommand } from './react-native-ci-cli'

const help: HelpCommand = require('./help')
const cycli: CycliCommand = require('./react-native-ci-cli')

const HELP_FLAG = 'help'

module.exports = {
  hidden: true,
  run: async (toolbox: GluegunToolbox) => {
    if (toolbox.parameters.options[HELP_FLAG]) {
      help.run(toolbox, cycli)
      return
    }
    cycli.run(toolbox)
  },
}
