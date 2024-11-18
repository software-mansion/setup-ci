import { GluegunCommand, GluegunToolbox } from 'gluegun'
import lint from '../recipes/lint'
import jest from '../recipes/jest'
import typescriptCheck from '../recipes/typescript'
import prettierCheck from '../recipes/prettier'
import eas from '../recipes/eas'
import detox from '../recipes/detox'
import maestro from '../recipes/maestro'
import isGitDirty from 'is-git-dirty'
import sequentialPromiseMap from '../utils/sequentialPromiseMap'
import { CycliError, CycliRecipe, CycliToolbox } from '../types'
import {
  CYCLI_COMMAND,
  HELP_FLAG,
  PRESET_FLAG,
  REPOSITORY_METRICS_HELP_URL,
  REPOSITORY_TROUBLESHOOTING_URL,
  SKIP_TELEMETRY_FLAG,
} from '../constants'
import { isCycliError, messageFromError } from '../utils/errors'

const SKIP_GIT_CHECK_FLAG = 'skip-git-check'

type Option = { flag: string; description: string }

export type CycliCommand = GluegunCommand & {
  description: string
  options: Option[]
  featureOptions: Option[]
}

const RECIPES = [
  lint,
  jest,
  typescriptCheck,
  prettierCheck,
  eas,
  detox,
  maestro,
]

// Try to obtain package manager and package root path.
// In case of failure, an error is thrown and cli exits early.
const validateProject = (toolbox: CycliToolbox) => {
  toolbox.context.packageManager()
  toolbox.context.path.packageRoot()
}

const checkGit = async (toolbox: CycliToolbox) => {
  if (isGitDirty() == null) {
    throw CycliError('This is not a git repository.')
  }

  if (isGitDirty()) {
    if (toolbox.parameters.options[SKIP_GIT_CHECK_FLAG]) {
      toolbox.interactive.surveyWarning(
        `Proceeding with dirty git repository as --${SKIP_GIT_CHECK_FLAG} option is enabled.`
      )
    } else {
      if (toolbox.options.isPreset()) {
        throw CycliError(
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
}

const runReactNativeCiCli = async (toolbox: CycliToolbox) => {
  const snapshotBefore = await toolbox.diff.gitStatus()
  toolbox.interactive.surveyStep(
    'Created snapshot of project state before execution.'
  )

  await toolbox.config.obtain(RECIPES)

  const executors = RECIPES.filter((recipe: CycliRecipe) =>
    toolbox.config.selectedRecipes().includes(recipe.meta.flag)
  ).map((recipe: CycliRecipe) => recipe.execute)

  if (executors.length === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.surveyStep(
    `Detected ${toolbox.context.packageManager()} as your package manager.`
  )

  await sequentialPromiseMap(executors, (executor) => executor(toolbox))

  const snapshotAfter = await toolbox.diff.gitStatus()
  const diff = toolbox.diff.compare(snapshotBefore, snapshotAfter)

  toolbox.prettier.formatFiles(Array.from(diff.keys()))

  toolbox.diff.print(diff)

  toolbox.furtherActions.print()

  const usedFlags = toolbox.config
    .selectedRecipes()
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

const run = async (toolbox: CycliToolbox) => {
  toolbox.interactive.vspace()
  toolbox.interactive.intro(` Welcome to npx ${CYCLI_COMMAND}! `)

  if (!toolbox.options.skipTelemetry()) {
    toolbox.interactive.surveyInfo(
      [
        `${CYCLI_COMMAND} collects anonymous usage data. You can disable it by using --skip-telemetry.`,
        `Learn more at ${REPOSITORY_METRICS_HELP_URL}`,
      ].join('\n'),
      'dim'
    )
  }

  let finishedWithUnexpectedError = false

  try {
    await checkGit(toolbox as CycliToolbox)
    validateProject(toolbox)

    await runReactNativeCiCli(toolbox as CycliToolbox)
  } catch (error: unknown) {
    toolbox.interactive.vspace()
    let errMessage = messageFromError(error)

    if (!isCycliError(error)) {
      errMessage = [
        `${CYCLI_COMMAND} failed with unexpected error:`,
        errMessage,
        `You can check ${REPOSITORY_TROUBLESHOOTING_URL} for potential solution.`,
      ].join('\n')

      finishedWithUnexpectedError = true
    }

    toolbox.interactive.error(errMessage)
  }

  try {
    if (!toolbox.options.skipTelemetry()) {
      await toolbox.telemetry.sendLog({
        version: toolbox.meta.version(),
        firstUse: toolbox.context.isFirstUse(),
        options: Object.fromEntries(
          RECIPES.map((recipe) => [
            recipe.meta.flag,
            toolbox.config.selectedRecipes().includes(recipe.meta.flag),
          ])
        ),
        error: finishedWithUnexpectedError,
      })
    }
  } catch (_: unknown) {
    // ignore telemetry errors
  }

  process.exit()
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
    {
      flag: SKIP_TELEMETRY_FLAG,
      description: 'Skip telemetry data collection',
    },
  ],
  featureOptions: [...getFeatureOptions()],
  run: (toolbox: GluegunToolbox) => run(toolbox as CycliToolbox),
}

module.exports = command
