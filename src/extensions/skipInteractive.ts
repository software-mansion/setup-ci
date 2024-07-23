import { GluegunToolbox } from 'gluegun'
import { SKIP_INTERACTIVE_FLAG } from '../constants'

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.skipInteractive = () =>
    Boolean(toolbox.parameters.options[SKIP_INTERACTIVE_FLAG])

  toolbox.skipInteractiveForRecipe = (recipe: string) =>
    Boolean(toolbox.parameters.options[recipe]) &&
    Boolean(toolbox.parameters.options[SKIP_INTERACTIVE_FLAG])
}
