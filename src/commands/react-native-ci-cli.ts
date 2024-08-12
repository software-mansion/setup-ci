import { GluegunCommand, GluegunToolbox } from 'gluegun'
import { SKIP_INTERACTIVE_FLAG } from '../constants'
import lint from '../recipes/lint'
import jest from '../recipes/jest'
import typescriptCheck from '../recipes/typescript'
import prettierCheck from '../recipes/prettier'
import easUpdate from '../recipes/eas-update'
import detox from '../recipes/detox'
import isGitDirty from 'is-git-dirty'
import sequentialPromiseMap from '../utils/sequentialPromiseMap'
import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import messageFromError from '../utils/messageFromError'
import { intersection } from 'lodash'

const SKIP_GIT_CHECK_FLAG = 'skip-git-check'
const COMMAND = 'react-native-ci-cli'

const RECIPES = [lint, jest, typescriptCheck, prettierCheck, easUpdate, detox]

const runReactNativeCiCli = async (toolbox: CycliToolbox) => {
  toolbox.interactive.intro('Welcome to React Native CI CLI')

  if (isGitDirty() == null) {
    throw Error('This is not a git repository.')
  }

  if (isGitDirty() && !toolbox.parameters.options[SKIP_GIT_CHECK_FLAG]) {
    if (toolbox.skipInteractive()) {
      throw Error(
        `You have to commit your changes before running in silent mode or use --${SKIP_GIT_CHECK_FLAG}.`
      )
    }

    const proceed = await toolbox.interactive.confirm(
      'You have uncommitted changes. Do you want to proceed?'
    )

    if (!proceed) {
      toolbox.interactive.outro(
        'Please commit your changes before running this command.'
      )
      return
    }
  }

  const context: ProjectContext = toolbox.projectContext.obtain()

  const featureFlags = getFeatureOptions().map((option) => option.flag)

  const selectedFeatureFlags = toolbox.skipInteractive()
    ? intersection(featureFlags, Object.keys(toolbox.parameters.options))
    : await toolbox.interactive.multiselect(
        'Select workflows you want to run on every PR',
        RECIPES.map((recipe: CycliRecipe) => ({
          label: recipe.meta.name,
          value: recipe.meta.flag,
        }))
      )

  context.selectedOptions = selectedFeatureFlags

  const executors = RECIPES.filter((recipe: CycliRecipe) =>
    selectedFeatureFlags.includes(recipe.meta.flag)
  ).map((recipe: CycliRecipe) => recipe.execute)

  if (executors.length === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.outro("Let's roll")

  toolbox.interactive.step(
    `Detected ${context.packageManager} as your package manager.`
  )

  await sequentialPromiseMap(executors, (executor) =>
    executor(toolbox, context)
  )

  const usedFlags = selectedFeatureFlags.map((flag) => `--${flag}`).join(' ')

  toolbox.interactive.success(`We're all set 🎉.`)

  if (!toolbox.skipInteractive()) {
    toolbox.interactive.success(
      `Next time you can run the command in silent mode using npx ${COMMAND} --${SKIP_INTERACTIVE_FLAG} ${usedFlags}.`
    )
  }
}

const getFeatureOptions = (): Option[] => {
  return RECIPES.map((recipe: CycliRecipe) => ({
    flag: recipe.meta.flag,
    description: recipe.meta.description,
  }))
}

const command: CycliCommand = {
  name: COMMAND,
  description: 'Quickly setup CI workflows for your React Native app',
  options: [
    { flag: 'help', description: 'Print help message' },
    { flag: 'version', description: 'Print version' },
    {
      flag: 'skip-git-check',
      description: 'Skip check for dirty git repository',
    },
    {
      flag: 'silent',
      description:
        'Run in silent mode. Combine with feature flags to specify generated workflows',
    },
  ],
  featureOptions: [...getFeatureOptions()],
  run: async (toolbox: GluegunToolbox) => {
    try {
      await runReactNativeCiCli(toolbox as CycliToolbox)
    } catch (error: unknown) {
      const errMessage = messageFromError(error)
      toolbox.interactive.error(
        `Failed to execute react-native-ci-cli with following error:\n${errMessage}`
      )
    } finally {
      process.exit()
    }
  },
}

type Option = { flag: string; description: string }

export type CycliCommand = GluegunCommand & {
  description: string
  options: Option[]
  featureOptions: Option[]
}

module.exports = command
