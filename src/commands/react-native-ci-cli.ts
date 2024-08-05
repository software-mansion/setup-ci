import { GluegunCommand, GluegunToolbox } from 'gluegun'
import { SKIP_INTERACTIVE_FLAG } from '../constants'
import runLint from '../recipes/lint'
import runJest from '../recipes/jest'
import runTypescriptCheck from '../recipes/typescript'
import runPrettierCheck from '../recipes/prettier'
import runEasUpdate from '../recipes/eas-update'
import isGitDirty from 'is-git-dirty'
import sequentialPromiseMap from '../utils/sequentialPromiseMap'
import { CycliToolbox, ProjectContext } from '../types'
import messageFromError from '../utils/messageFromError'

const SKIP_GIT_CHECK_FLAG = 'skip-git-check'

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

  const lintExecutor = await runLint(toolbox, context)
  const jestExecutor = await runJest(toolbox, context)
  const typescriptExecutor = await runTypescriptCheck(toolbox, context)
  const prettierExecutor = await runPrettierCheck(toolbox, context)
  const easUpdateExecutor = await runEasUpdate(toolbox, context)

  const executors = [
    lintExecutor,
    jestExecutor,
    typescriptExecutor,
    prettierExecutor,
    easUpdateExecutor,
  ].filter((executor) => executor != null)

  if (executors.length === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.outro("Let's roll")

  toolbox.interactive.step(
    `Detected ${context.packageManager} as your package manager.`
  )

  const executorResults = await sequentialPromiseMap(executors, (executor) =>
    executor(toolbox, context)
  )

  const usedFlags = executorResults.join(' ')

  toolbox.interactive.success(
    `We're all set 🎉.\nNext time you can run the command in silent mode using npx create-react-native-ci-cli --${SKIP_INTERACTIVE_FLAG} ${usedFlags}.`
  )
}

const command: GluegunCommand = {
  name: 'react-native-ci-cli',
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

module.exports = command
