import {
  MAIN_FLAG,
  NON_INTERACTIVE_FLAG,
  PULL_REQUEST_FLAG,
  SKIP_TELEMETRY_FLAG,
} from '../constants'
import { CycliError, CycliRecipeType, CycliToolbox } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const getListOfParameters = (key: string): string[] => {
    const argv = toolbox.parameters.argv

    const pullRequestFlagIdx = argv.findIndex(
      (arg: string) => arg === `-${key}`
    )

    if (pullRequestFlagIdx === -1) {
      return []
    }

    let lastPullRequestRecipeIdx = argv.findIndex(
      (arg: string, idx: number) =>
        idx > pullRequestFlagIdx && arg.startsWith('-')
    )

    if (lastPullRequestRecipeIdx === -1) {
      lastPullRequestRecipeIdx = argv.length
    }

    return argv.slice(pullRequestFlagIdx + 1, lastPullRequestRecipeIdx)
  }

  const validateOnlyKnownRecipes = (recipes: string[]): CycliRecipeType[] => {
    recipes.forEach((recipe) => {
      if (!(Object.values(CycliRecipeType) as string[]).includes(recipe)) {
        throw CycliError(`Unknown recipe: ${recipe}`)
      }
    })
    return recipes as CycliRecipeType[]
  }

  const isPreset = () =>
    Boolean(toolbox.parameters.argv.includes(`-${PULL_REQUEST_FLAG}`)) ||
    Boolean(toolbox.parameters.argv.includes(`-${MAIN_FLAG}`))

  const pullRequestRecipes = (): CycliRecipeType[] =>
    validateOnlyKnownRecipes(getListOfParameters(PULL_REQUEST_FLAG))

  const mainRecipes = (): CycliRecipeType[] =>
    validateOnlyKnownRecipes(getListOfParameters(MAIN_FLAG))

  const isNonInteractive = () =>
    Boolean(toolbox.parameters.options[NON_INTERACTIVE_FLAG])

  const skipTelemetry = () =>
    Boolean(toolbox.parameters.options[SKIP_TELEMETRY_FLAG])

  toolbox.options = {
    isPreset,
    pullRequestRecipes,
    mainRecipes,
    isNonInteractive,
    skipTelemetry,
  }
}

export interface OptionsExtension {
  options: {
    isPreset: () => boolean
    pullRequestRecipes: () => CycliRecipeType[]
    mainRecipes: () => CycliRecipeType[]
    isNonInteractive: () => boolean
    skipTelemetry: () => boolean
  }
}
