import {
  CycliConfig,
  CycliError,
  CycliRecipe,
  CycliRecipeType,
  CycliToolbox,
  WorkflowEventType,
} from '../types'
import { messageFromError } from '../utils/errors'
import { DOCS_WORKFLOWS_URL, RECIPES } from '../constants'

module.exports = (toolbox: CycliToolbox) => {
  // State for caching the config
  let config: CycliConfig | undefined = undefined

  const recipeToMultiselectOption = ({
    validate,
    meta: { name, flag, selectHint },
  }: CycliRecipe) => {
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

  const prompt = async (): Promise<CycliConfig> => {
    let selectedPullRequestRecipes: CycliRecipeType[] = []
    let selectedMainRecipes: CycliRecipeType[] = []

    if (toolbox.options.isPreset()) {
      selectedPullRequestRecipes = toolbox.options.pullRequestRecipes()
      selectedMainRecipes = toolbox.options.mainRecipes()
      const selectedRecipes = [
        ...selectedMainRecipes,
        ...selectedPullRequestRecipes,
      ]

      selectedRecipes.forEach((recipe: CycliRecipeType) => {
        try {
          RECIPES[recipe].validate?.(toolbox)
        } catch (error: unknown) {
          const validationError = messageFromError(error)

          // adding context to validation error reason (used in multiselect menu hint)
          throw CycliError(
            `Cannot generate ${RECIPES[recipe].meta.name} workflow in your project.\nReason: ${validationError}`
          )
        }
      })

      selectedPullRequestRecipes.forEach((recipe: CycliRecipeType) => {
        if (
          !RECIPES[recipe].meta.allowedEvents.includes(
            WorkflowEventType.PULL_REQUEST
          )
        ) {
          throw CycliError(
            `Cannot generate ${RECIPES[recipe].meta.name} workflow for pull requests.`
          )
        }
      })

      selectedMainRecipes.forEach((recipe: CycliRecipeType) => {
        if (
          !RECIPES[recipe].meta.allowedEvents.includes(WorkflowEventType.PUSH)
        ) {
          throw CycliError(
            `Cannot generate ${RECIPES[recipe].meta.name} workflow for push to main branch.`
          )
        }
      })
    } else {
      selectedPullRequestRecipes = (await toolbox.interactive.multiselect(
        'Select workflows you want to run on every PR',
        `Learn more about available workflows: ${DOCS_WORKFLOWS_URL}`,
        Object.values(RECIPES)
          .filter((recipe) =>
            recipe.meta.allowedEvents.includes(WorkflowEventType.PULL_REQUEST)
          )
          .map(recipeToMultiselectOption),
        false,
        'blue'
      )) as CycliRecipeType[]

      selectedMainRecipes = (await toolbox.interactive.multiselect(
        'Select workflows you want to run on every push to main branch',
        `Learn more about available workflows: ${DOCS_WORKFLOWS_URL}`,
        Object.values(RECIPES)
          .filter((recipe) =>
            recipe.meta.allowedEvents.includes(WorkflowEventType.PUSH)
          )
          .map(recipeToMultiselectOption),
        false,
        'magenta'
      )) as CycliRecipeType[]
    }
    return new Map([
      [
        { type: WorkflowEventType.PULL_REQUEST },
        new Set(selectedPullRequestRecipes),
      ],
      [
        { type: WorkflowEventType.PUSH, branch: 'main' },
        new Set(selectedMainRecipes),
      ],
    ])
  }

  const getPullRequestRecipes = (): CycliRecipeType[] => {
    return Array.from(
      Array.from(config?.entries() ?? []).find(
        ([event]) => event.type === WorkflowEventType.PULL_REQUEST
      )?.[1] ?? []
    )
  }

  const getMainRecipes = (): CycliRecipeType[] => {
    return Array.from(
      Array.from(config?.entries() ?? []).find(
        ([event]) => event.type === WorkflowEventType.PUSH
      )?.[1] ?? []
    )
  }

  const getSelectedRecipes = async (): Promise<Set<CycliRecipeType>> => {
    if (config === undefined) {
      throw Error('Config not initialized')
    }

    return new Set(
      Array.from(config.values())
        .map((s) => Array.from(s))
        .flat()
    )
  }

  const get = async (): Promise<CycliConfig> => {
    if (config === undefined) {
      config = await prompt()
    }
    return config
  }

  toolbox.config = {
    prompt,
    getPullRequestRecipes,
    getMainRecipes,
    getSelectedRecipes,
    get,
  }
}

export interface ConfigExtension {
  config: {
    get: () => Promise<CycliConfig>
    getPullRequestRecipes: () => CycliRecipeType[]
    getMainRecipes: () => CycliRecipeType[]
    getSelectedRecipes: () => Promise<Set<CycliRecipeType>>
  }
}
