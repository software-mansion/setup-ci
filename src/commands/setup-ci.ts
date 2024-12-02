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
import { CycliError, CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import intersection from 'lodash/intersection'
import {
  COLORS,
  CYCLI_COMMAND,
  DOCS_WORKFLOWS_URL,
  HELP_FLAG,
  PRESET_FLAG,
  REPOSITORY_METRICS_HELP_URL,
  REPOSITORY_TROUBLESHOOTING_URL,
  REPOSITORY_URL,
  SKIP_TELEMETRY_FLAG,
} from '../constants'
import { isCycliError, messageFromError } from '../utils/errors'

const FEEDBACK_SURVEY_URL = 'https://forms.gle/NYoPyPxnVzGheHcw6'

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

          // adding context to validation error reason (used in multiselect menu hint)
          throw CycliError(
            `Cannot generate ${recipe.meta.name} workflow in your project.\nReason: ${validationError}`
          )
        }
      }
    })

    return selectedOptions
  } else {
    return await toolbox.interactive.multiselect(
      'Select workflows you want to run on every PR',
      `Learn more about PR workflows: ${DOCS_WORKFLOWS_URL}`,
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

const runReactNativeCiCli = async (
  toolbox: CycliToolbox,
  context: ProjectContext
) => {
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

  const snapshotAfter = await toolbox.diff.gitStatus(context)
  const diff = toolbox.diff.compare(snapshotBefore, snapshotAfter)

  toolbox.prettier.formatFiles(Array.from(diff.keys()))

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

  toolbox.interactive.vspace()

  toolbox.interactive.info(
    [
      `Thank you for using ${COLORS.cyan('setup-ci')} 💙`,
      "We'd love to hear your feedback to make it even better.",
      'Please take a moment to fill out our survey:\n',
      `\t → ${FEEDBACK_SURVEY_URL}\n`,
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

const run = async (toolbox: CycliToolbox) => {
  toolbox.interactive.surveyInfo(
    [
      `${COLORS.cyan(
        `npx ${CYCLI_COMMAND}`
      )} aims to help you set up CI workflows for your React Native app.`,
      `If you find the project useful, you can give us a ⭐ on GitHub:`,
      '',
      `\t\t → ${REPOSITORY_URL}`,
    ].join('\n'),
    'green'
  )

  if (!toolbox.options.skipTelemetry()) {
    toolbox.interactive.surveyInfo(
      [
        `This script collects anonymous usage data. You can disable it by using --skip-telemetry.`,
        `Learn more at ${REPOSITORY_METRICS_HELP_URL}`,
      ].join('\n'),
      'dim'
    )
  }

  let finishedWithUnexpectedError = false
  let context: ProjectContext | undefined

  try {
    await checkGit(toolbox as CycliToolbox)

    context = toolbox.projectContext.obtain()
    toolbox.interactive.surveyStep('Obtained project context.')

    await runReactNativeCiCli(
      toolbox as CycliToolbox,
      context as ProjectContext
    )
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
        firstUse: context?.firstUse,
        options:
          context &&
          Object.fromEntries(
            RECIPES.map((recipe) => [
              recipe.meta.flag,
              (context as ProjectContext).selectedOptions.includes(
                recipe.meta.flag
              ),
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
