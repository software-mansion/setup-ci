import { GluegunToolbox } from 'gluegun'
import { SKIP_INTERACTIVE_COMMAND } from '../constants'

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.skipInteractiveForCommand = (command: string) =>
    Boolean(toolbox.parameters[command]) &&
    Boolean(toolbox.parameters[SKIP_INTERACTIVE_COMMAND])
}
