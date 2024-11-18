import {
  CycliError,
  CycliRecipe,
  CycliRecipeFlag,
  CycliToolbox,
} from '../types'
import intersection from 'lodash/intersection'
import { messageFromError } from '../utils/errors'
import { REPOSITORY_FEATURES_HELP_URL } from '../constants'

module.exports = (toolbox: CycliToolbox) => {
  // State for caching the config
  let selectedRecipes: CycliRecipeFlag[] | undefined = undefined

  const obtain = async (allRecipes: CycliRecipe[]): Promise<void> => {
    if (toolbox.options.isPreset()) {
      const allFlags = Object.values(CycliRecipeFlag)

      selectedRecipes = intersection(
        allFlags,
        Object.keys(toolbox.parameters.options)
          .filter((option) => allFlags.includes(option as CycliRecipeFlag))
          .map((flag) => flag as CycliRecipeFlag)
      )

      allRecipes.forEach((recipe: CycliRecipe) => {
        if (selectedRecipes?.includes(recipe.meta.flag)) {
          try {
            recipe.validate?.(toolbox)
          } catch (error: unknown) {
            const validationError = messageFromError(error)

            // adding context to validation error reason (used in multiselect menu hint)
            throw CycliError(
              `Cannot generate ${recipe.meta.name} workflow in your project.\nReason: ${validationError}`
            )
          }
        }
      })
    } else {
      selectedRecipes = (await toolbox.interactive.multiselect(
        'Select workflows you want to run on every PR',
        `Learn more about PR workflows: ${REPOSITORY_FEATURES_HELP_URL}`,
        allRecipes.map(
          ({ validate, meta: { name, flag, selectHint } }: CycliRecipe) => {
            let validationError = ''
            try {
              validate?.(toolbox)
            } catch (error: unknown) {
              validationError = messageFromError(error)
            }
            const hint = validationError || selectHint
            const disabled = Boolean(validationError)
            return {
              label: name,
              value: flag,
              hint,
              disabled,
            }
          }
        )
      )) as CycliRecipeFlag[]
    }
  }

  const getSelectedRecipes = (): CycliRecipeFlag[] => {
    return selectedRecipes || []
  }

  toolbox.config = {
    obtain,
    selectedRecipes: getSelectedRecipes,
  }
}

export interface ConfigExtension {
  config: {
    obtain: (allRecipes: CycliRecipe[]) => Promise<void>
    selectedRecipes: () => CycliRecipeFlag[]
  }
}
