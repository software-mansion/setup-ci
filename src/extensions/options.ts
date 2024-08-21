import { PRESET_FLAG } from '../constants'
import { CycliToolbox } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const isPreset = () => Boolean(toolbox.parameters.options[PRESET_FLAG])

  const isRecipeSelected = (recipeFlag: string) =>
    Boolean(toolbox.parameters.options[PRESET_FLAG]) &&
    Boolean(toolbox.parameters.options[recipeFlag])

  toolbox.options = {
    isPreset,
    isRecipeSelected,
  }
}

export interface OptionsExtension {
  options: {
    isPreset: () => boolean
    isRecipeSelected: (recipeFlag: string) => boolean
  }
}
