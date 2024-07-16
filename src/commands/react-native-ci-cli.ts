import { GluegunCommand, GluegunToolbox } from 'gluegun'
import { SKIP_INTERACTIVE_COMMAND } from '../constants'
import runLint from '../recipes/lint'
import runJest from '../recipes/jest'
import isGitDirty from 'is-git-dirty'
import sequentialPromiseMap from '../utils/sequentialPromiseMap'
import { ProjectContext } from '../types'

const runReactNativeCiCli = async (toolbox: GluegunToolbox) => {
  toolbox.interactive.intro('Welcome to React Native CI CLI')

  if (isGitDirty() == null) {
    throw Error('This is not a git repository.')
  }

  if (isGitDirty() == true) {
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

  const lintExecutor = await runLint(toolbox)
  const jestExecutor = await runJest(toolbox)

  const executors = [lintExecutor, jestExecutor].filter(Boolean)

  if (executors.length === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.outro("Let's roll")

  const context: ProjectContext = toolbox.projectContext.obtain()

  toolbox.interactive.step(
    `Detected ${context.packageManager} as your package manager.`
  )

  const executorResults = await sequentialPromiseMap(executors, (executor) =>
    executor(toolbox, context)
  )

  const usedFlags = executorResults.join(' ')

  toolbox.interactive.success(
    `We're all set 🎉.\nNext time you can use silent command: npx create-react-native-ci-cli --${SKIP_INTERACTIVE_COMMAND} ${usedFlags}.`
  )
}

const command: GluegunCommand = {
  name: 'react-native-ci-cli',
  run: async (toolbox: GluegunToolbox) => {
    try {
      await runReactNativeCiCli(toolbox)
    } catch (error) {
      toolbox.interactive.error(
        `Failed to execute react-native-ci-cli with following error:\n${error.message}`
      )
    } finally {
      process.exit()
    }
  },
}

module.exports = command
