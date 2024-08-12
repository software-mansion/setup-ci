import { SKIP_INTERACTIVE_FLAG } from '../constants'
import { CycliToolbox } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  toolbox.skipInteractive = () =>
    Boolean(toolbox.parameters.options[SKIP_INTERACTIVE_FLAG])
}

export interface SkipInteractiveExtension {
  skipInteractive: () => boolean
  skipInteractiveForRecipe: (recipe: string) => boolean
}
