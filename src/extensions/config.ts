import {
  CycliError,
  CycliRecipe,
  CycliRecipeType,
  CycliToolbox,
} from '../types'
import intersection from 'lodash/intersection'
import { messageFromError } from '../utils/errors'
import { DOCS_WORKFLOWS_URL } from '../constants'

module.exports = (toolbox: CycliToolbox) => {
  // State for caching the config
  let selectedRecipes: CycliRecipeType[] | undefined = undefined

  const prompt = async (allRecipes: CycliRecipe[]): Promise<void> => {
    if (toolbox.options.isPreset()) {
      const allFlags = Object.values(CycliRecipeType)

      selectedRecipes = intersection(
        allFlags,
        Object.keys(toolbox.parameters.options)
          .filter((option) => allFlags.includes(option as CycliRecipeType))
          .map((flag) => flag as CycliRecipeType)
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
        `Learn more about PR workflows: ${DOCS_WORKFLOWS_URL}`,
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
      )) as CycliRecipeType[]
    }
  }

  const getSelectedRecipes = (): CycliRecipeType[] => {
    return selectedRecipes || []
  }

  toolbox.config = {
    prompt,
    getSelectedRecipes,
  }
}

export interface ConfigExtension {
  config: {
    prompt: (allRecipes: CycliRecipe[]) => Promise<void>
    getSelectedRecipes: () => CycliRecipeType[]
  }
}
