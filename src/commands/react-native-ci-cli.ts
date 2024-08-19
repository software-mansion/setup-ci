import { GluegunCommand, GluegunToolbox } from 'gluegun'
import lint from '../recipes/lint'
import jest from '../recipes/jest'
import typescriptCheck from '../recipes/typescript'
import prettierCheck from '../recipes/prettier'
import easUpdate from '../recipes/eas-update'
import detox from '../recipes/detox'
import isGitDirty from 'is-git-dirty'
import sequentialPromiseMap from '../utils/sequentialPromiseMap'
import { CycliToolbox, ProjectContext } from '../types'
import messageFromError from '../utils/messageFromError'
import { PRESET_FLAG } from '../constants'

const COMMAND = 'react-native-ci-cli'
const DESCRIPTION = 'Quickly setup CI workflows for your React Native app'
const VERSION_FLAG = 'version'
const VERSION_FLAG_DESCRIPTION = 'Print version'
const HELP_FLAG = 'help'
const HELP_FLAG_DESCRIPTION = 'Print help message'
const PRESET_FLAG_DESCRIPTION =
  'Run with preset. Combine with feature flags to specify generated workflows'
const SKIP_GIT_CHECK_FLAG = 'skip-git-check'
const SKIP_GIT_CHECK_FLAG_DESCRIPTION = 'Skip check for dirty git repository'

type Option = { flag: string; description: string }

export type CycliCommand = GluegunCommand & {
  description: string
  options: Option[]
  featureOptions: Option[]
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
          `It is advised to commit all your changes before running ${COMMAND}.`,
          'Running the script with uncommitted changes may have destructive consequences.',
          'Do you want to proceed anyway?',
        ].join('\n'),
        'warning'
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

  const snapshotBefore = await toolbox.diff.gitStatus(context)

  const lintExecutor = await lint.run(toolbox, context)
  const jestExecutor = await jest.run(toolbox, context)
  const typescriptExecutor = await typescriptCheck.run(toolbox, context)
  const prettierExecutor = await prettierCheck.run(toolbox, context)
  const easUpdateExecutor = await easUpdate.run(toolbox, context)
  const detoxExecutor = await detox.run(toolbox, context)

  const executors = [
    lintExecutor,
    jestExecutor,
    typescriptExecutor,
    prettierExecutor,
    easUpdateExecutor,
    detoxExecutor,
  ].filter((executor) => executor != null)

  if (executors.length === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.outro("Let's roll")

  toolbox.interactive.step(
    `Detected ${context.packageManager} as your package manager.`
  )

  const executorResults: string[] = await sequentialPromiseMap(
    executors,
    (executor) => executor(toolbox, context)
  )

  const snapshotAfter = await toolbox.diff.gitStatus(context)
  const diff = toolbox.diff.compare(snapshotBefore, snapshotAfter)
  toolbox.diff.print(diff, context)

  toolbox.furtherActions.print()

  const usedFlags = executorResults.join(' ')

  toolbox.interactive.vspace()
  toolbox.interactive.success(`We're all set 🎉`)

  if (!toolbox.options.isPreset()) {
    toolbox.interactive.success(
      `Next time you can specify a preset to reproduce this run using npx ${COMMAND} --${PRESET_FLAG} ${usedFlags}.`
    )
  }
}

const run = async (toolbox: GluegunToolbox) => {
  try {
    await runReactNativeCiCli(toolbox as CycliToolbox)
  } catch (error: unknown) {
    const errMessage = messageFromError(error)
    toolbox.interactive.error(
      `Failed to execute ${COMMAND} with following error:\n${errMessage}`
    )
  } finally {
    process.exit()
  }
}

export const getFeatureOptions = (): Option[] => {
  return [
    lint.meta,
    jest.meta,
    typescriptCheck.meta,
    prettierCheck.meta,
    easUpdate.meta,
    detox.meta,
  ].map((meta) => ({
    flag: meta.flag,
    description: meta.description,
  }))
}

const command: CycliCommand = {
  name: COMMAND,
  description: DESCRIPTION,
  options: [
    { flag: HELP_FLAG, description: HELP_FLAG_DESCRIPTION },
    { flag: VERSION_FLAG, description: VERSION_FLAG_DESCRIPTION },
    {
      flag: SKIP_GIT_CHECK_FLAG,
      description: SKIP_GIT_CHECK_FLAG_DESCRIPTION,
    },
    {
      flag: PRESET_FLAG,
      description: PRESET_FLAG_DESCRIPTION,
    },
  ],
  featureOptions: [...getFeatureOptions()],
  run,
}

module.exports = command
