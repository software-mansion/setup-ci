import { GluegunToolbox } from 'gluegun'
import { HelpCommand } from './help'
import { CycliCommand } from './setup-ci'
import { HELP_FLAG } from '../constants'

const help: HelpCommand = require('./help')
const cycli: CycliCommand = require('./setup-ci')

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
