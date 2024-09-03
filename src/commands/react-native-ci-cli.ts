import { GluegunCommand, GluegunToolbox } from 'gluegun'
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
import intersection from 'lodash/intersection'
import { addTerminatingNewline } from '../utils/addTerminatingNewline'
import {
  CYCLI_COMMAND,
  HELP_FLAG,
  PRESET_FLAG,
  REPOSITORY_FEATURES_HELP_URL,
} from '../constants'

const SKIP_GIT_CHECK_FLAG = 'skip-git-check'

type Option = { flag: string; description: string }

export type CycliCommand = GluegunCommand & {
  description: string
  options: Option[]
  featureOptions: Option[]
}

const RECIPES = [lint, jest, typescriptCheck, prettierCheck, easUpdate, detox]

const getSelectedOptions = async (toolbox: CycliToolbox): Promise<string[]> => {
  if (toolbox.options.isPreset()) {
    const featureFlags = RECIPES.map((option) => option.meta.flag)

    const selectedOptions = intersection(
      featureFlags,
      Object.keys(toolbox.parameters.options)
    )

    RECIPES.forEach((recipe: CycliRecipe) => {
      if (selectedOptions.includes(recipe.meta.flag)) {
        try {
          recipe.validate?.(toolbox)
        } catch (error: unknown) {
          const validationError = messageFromError(error)

          // Rethrowing error with more informative message
          throw Error(
            `Cannot generate ${recipe.meta.name} workflow in your project.\nReason: ${validationError}`
          )
        }
      }
    })

    return selectedOptions
  } else {
    return await toolbox.interactive.multiselect(
      'Select workflows you want to run on every PR',
      `Learn more about PR workflows: ${REPOSITORY_FEATURES_HELP_URL}`,
      RECIPES.map(
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
    )
  }
}

const runReactNativeCiCli = async (toolbox: CycliToolbox) => {
  toolbox.interactive.vspace()
  toolbox.interactive.intro(' Welcome to React Native CI CLI! ')

  if (isGitDirty() == null) {
    throw Error('This is not a git repository.')
  }

  if (isGitDirty()) {
    if (toolbox.parameters.options[SKIP_GIT_CHECK_FLAG]) {
      toolbox.interactive.surveyWarning(
        `Proceeding with dirty git repository as --${SKIP_GIT_CHECK_FLAG} option is enabled.`
      )
    } else {
      if (toolbox.options.isPreset()) {
        throw Error(
          `You have to commit your changes before running with preset or use --${SKIP_GIT_CHECK_FLAG}.`
        )
      }

      const proceed = await toolbox.interactive.confirm(
        [
          `It is advised to commit all your changes before running ${CYCLI_COMMAND}.`,
          'Running the script with uncommitted changes may have destructive consequences.',
          'Do you want to proceed anyway?\n',
        ].join('\n'),
        { type: 'warning' }
      )

      if (!proceed) {
        toolbox.interactive.outro(
          'Please commit your changes before running this command.'
        )
        return
      }
    }
  }

  const context: ProjectContext = toolbox.projectContext.obtain()
  toolbox.interactive.surveyStep('Obtained project context.')

  const snapshotBefore = await toolbox.diff.gitStatus(context)
  toolbox.interactive.surveyStep(
    'Created snapshot of project state before execution.'
  )

  context.selectedOptions = await getSelectedOptions(toolbox)

  const executors = RECIPES.filter((recipe: CycliRecipe) =>
    context.selectedOptions.includes(recipe.meta.flag)
  ).map((recipe: CycliRecipe) => recipe.execute)

  if (executors.length === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.surveyStep(
    `Detected ${context.packageManager} as your package manager.`
  )

  await sequentialPromiseMap(executors, (executor) =>
    executor(toolbox, context)
  )

  // Sometimes gluegun leaves package.json without eol at the end
  addTerminatingNewline('package.json')

  const snapshotAfter = await toolbox.diff.gitStatus(context)
  const diff = toolbox.diff.compare(snapshotBefore, snapshotAfter)
  toolbox.diff.print(diff, context)

  toolbox.furtherActions.print()

  const usedFlags = context.selectedOptions
    .map((flag: string) => `--${flag}`)
    .join(' ')

  toolbox.interactive.vspace()
  toolbox.interactive.success(`We're all set 🎉`)

  if (!toolbox.options.isPreset()) {
    toolbox.interactive.success(
      `Next time you can specify a preset to reproduce this run using npx ${CYCLI_COMMAND} --${PRESET_FLAG} ${usedFlags}.`
    )
  }
}

const run = async (toolbox: GluegunToolbox) => {
  try {
    await runReactNativeCiCli(toolbox as CycliToolbox)
  } catch (error: unknown) {
    const errMessage = messageFromError(error)
    toolbox.interactive.vspace()
    toolbox.interactive.error(
      `Failed to execute ${CYCLI_COMMAND} with following error:\n${errMessage}`
    )
  } finally {
    process.exit()
  }
}

const getFeatureOptions = (): Option[] => {
  return RECIPES.map((recipe: CycliRecipe) => ({
    flag: recipe.meta.flag,
    description: recipe.meta.description,
  }))
}

const command: CycliCommand = {
  name: CYCLI_COMMAND,
  description: 'Quickly setup CI workflows for your React Native app',
  options: [
    { flag: HELP_FLAG, description: 'Print help message' },
    { flag: 'version', description: 'Print version' },
    {
      flag: SKIP_GIT_CHECK_FLAG,
      description: 'Skip check for dirty git repository',
    },
    {
      flag: PRESET_FLAG,
      description:
        'Run with preset. Combine with feature flags to specify generated workflows',
    },
  ],
  featureOptions: [...getFeatureOptions()],
  run,
}

module.exports = command
