import { GluegunCommand } from 'gluegun'
import { SKIP_INTERACTIVE_COMMAND } from '../constants'
import runLint from '../recipies/lint'
import runJest from '../recipies/jest'
import isGitDirty from 'is-git-dirty'
import sequentialPromiseMap from '../utils/sequentialPromiseMap'

const command: GluegunCommand = {
  name: 'react-native-ci-cli',
  run: async (toolbox) => {
    toolbox.interactive.intro('Welcome to React Native CI CLI')

    if (isGitDirty() == null) {
      toolbox.interactive.outro('This is not a git repository. Exiting.')
      return
    }

    if (isGitDirty() == true) {
      const proceed = await toolbox.interactive.confirm(
        'You have uncommitted changes. Do you want to proceed?'
      )

      if (!proceed) {
        toolbox.interactive.outro(
          'Please commit your changes before running this command. Exiting.'
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

    const executorResults = await sequentialPromiseMap(executors, (executor) =>
      executor(toolbox)
    )

    const usedFlags = executorResults.join(' ')

    toolbox.print.success(
      `We're all set 🎉.\nNext time you can use silent command: npx create-react-native-ci-cli --${SKIP_INTERACTIVE_COMMAND} ${usedFlags}.`
    )

    process.exit()
  },
}

module.exports = command
