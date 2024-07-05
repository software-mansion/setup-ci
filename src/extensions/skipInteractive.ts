import { GluegunToolbox } from 'gluegun'
import { SKIP_INTERACTIVE_COMMAND } from '../constants'

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.skipInteractiveForCommand = (command: string) =>
    Boolean(toolbox.parameters.options[command]) &&
    Boolean(toolbox.parameters.options[SKIP_INTERACTIVE_COMMAND])
}
