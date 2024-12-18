import { GluegunCommand, GluegunToolbox } from 'gluegun'
import isGitDirty from 'is-git-dirty'
import { CycliError, CycliRecipe, CycliToolbox } from '../types'
import {
  COLORS,
  CYCLI_COMMAND,
  HELP_FLAG,
  MAIN_FLAG,
  PULL_REQUEST_FLAG,
  RECIPES,
  REPOSITORY_METRICS_HELP_URL,
  REPOSITORY_TROUBLESHOOTING_URL,
  REPOSITORY_URL,
  SKIP_TELEMETRY_FLAG,
} from '../constants'
import { isCycliError, messageFromError } from '../utils/errors'

const FEEDBACK_SURVEY_URL = 'https://forms.gle/NYoPyPxnVzGheHcw6'

const SKIP_GIT_CHECK_FLAG = 'skip-git-check'

type Option = { flag: string; description: string; params: boolean }

export type CycliCommand = GluegunCommand & {
  description: string
  options: Option[]
  featureOptions: Option[]
}

const runReactNativeCiCli = async (toolbox: CycliToolbox) => {
  const snapshotBefore = await toolbox.diff.gitStatus()
  toolbox.interactive.surveyStep(
    'Created snapshot of project state before execution.'
  )

  await toolbox.config.get()

  if ((await toolbox.config.getSelectedRecipes()).size === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.surveyStep(
    `Detected ${toolbox.context.packageManager()} as your package manager.`
  )

  await toolbox.executor.configureProject()
  await toolbox.executor.generateWorkflows()

  const snapshotAfter = await toolbox.diff.gitStatus()
  const diff = toolbox.diff.compare(snapshotBefore, snapshotAfter)
  toolbox.diff.print(diff)

  toolbox.prettier.formatFiles(Array.from(diff.keys()))

  toolbox.furtherActions.print()

  toolbox.interactive.vspace()
  toolbox.interactive.success(`We're all set 🎉`)

  if (!toolbox.options.isPreset()) {
    const pullRequestRecipes = toolbox.config.getPullRequestRecipes()
    const mainRecipes = toolbox.config.getMainRecipes()

    let presetMessage = `Next time you can specify a preset to reproduce this run using npx ${CYCLI_COMMAND}`

    if (pullRequestRecipes.length > 0) {
      presetMessage += ` -${PULL_REQUEST_FLAG} ${pullRequestRecipes.join(' ')}`
    }
    if (mainRecipes.length > 0) {
      presetMessage += ` -${MAIN_FLAG} ${mainRecipes.join(' ')}`
    }

    toolbox.interactive.success(presetMessage)
  }

  toolbox.interactive.vspace()

  toolbox.interactive.info(
    [
      `Thank you for using ${COLORS.cyan('setup-ci')} 💙`,
      "We'd love to hear your feedback to make it even better.",
      'Please take a moment to fill out our survey:\n',
      `\t → ${FEEDBACK_SURVEY_URL} \n`,
      'Your input is greatly appreciated! 🙏',
    ].join('\n'),
    'green'
  )
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
          `You have to commit your changes before running with preset or use--${SKIP_GIT_CHECK_FLAG}.`
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

// Try to obtain package manager and package root path.
// In case of failure, an error is thrown and cli exits early.
const validateProject = (toolbox: CycliToolbox) => {
  toolbox.context.packageManager()
  toolbox.context.path.packageRoot()
}

const run = async (toolbox: CycliToolbox) => {
  toolbox.interactive.surveyInfo(
    [
      `${COLORS.cyan(
        `npx ${CYCLI_COMMAND}`
      )} aims to help you set up CI workflows for your React Native app.`,
      `If you find the project useful, you can give us a ⭐ on GitHub: `,
      '',
      `\t\t → ${REPOSITORY_URL} `,
    ].join('\n'),
    'green'
  )

  if (!toolbox.options.skipTelemetry()) {
    toolbox.interactive.surveyInfo(
      [
        `This script collects anonymous usage data.You can disable it by using--skip - telemetry.`,
        `Learn more at ${REPOSITORY_METRICS_HELP_URL} `,
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
        `${CYCLI_COMMAND} failed with unexpected error: `,
        errMessage,
        `You can check ${REPOSITORY_TROUBLESHOOTING_URL} for potential solution.`,
      ].join('\n')

      finishedWithUnexpectedError = true
    }

    toolbox.interactive.error(errMessage)
  }

  try {
    const selectedRecipes = await toolbox.config.getSelectedRecipes()

    if (!toolbox.options.skipTelemetry()) {
      await toolbox.telemetry.sendLog({
        version: toolbox.meta.version(),
        firstUse: toolbox.context.isFirstUse(),
        options: Object.fromEntries(
          Object.values(RECIPES).map((recipe) => [
            recipe.meta.flag,
            selectedRecipes.has(recipe.meta.flag),
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
  return Object.values(RECIPES).map((recipe: CycliRecipe) => ({
    flag: recipe.meta.flag,
    description: recipe.meta.description,
    params: false,
  }))
}

const command: CycliCommand = {
  name: CYCLI_COMMAND,
  description: 'Quickly setup CI workflows for your React Native app',
  options: [
    { flag: HELP_FLAG, description: 'Print help message', params: false },
    { flag: 'version', description: 'Print version', params: false },
    {
      flag: SKIP_GIT_CHECK_FLAG,
      description: 'Skip check for dirty git repository',
      params: false,
    },
    {
      flag: SKIP_TELEMETRY_FLAG,
      description: 'Skip telemetry data collection',
      params: false,
    },
    {
      flag: PULL_REQUEST_FLAG,
      description: 'Specify workflows to generate to run on every pull request',
      params: true,
    },
    {
      flag: MAIN_FLAG,
      description:
        'Specify workflows to generate to run on every push to the main branch',
      params: true,
    },
  ],
  featureOptions: [...getFeatureOptions()],
  run: (toolbox: GluegunToolbox) => run(toolbox as CycliToolbox),
}

module.exports = command
