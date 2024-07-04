import { GluegunCommand } from 'gluegun'
import { intro, outro } from '@clack/prompts'
import { SKIP_INTERACTIVE_COMMAND } from '../constants'
import runLint from '../recipies/lint'
import runJest from '../recipies/jest'

const command: GluegunCommand = {
  name: 'react-native-ci-cli',
  run: async (toolbox) => {
    intro('Welcome to React Native CI CLI')

    if (toolbox.isGitDirty() == null) {
      outro('This is not a git repository. Exiting.')
      return
    }

    if (toolbox.isGitDirty() == true) {
      outro('Please commit your changes before running this command. Exiting.')
      return
    }

    const lintExecutor = await runLint(toolbox)
    const jestExecutor = await runJest(toolbox)

    const executors = [lintExecutor, jestExecutor].filter(Boolean)

    if (executors.length === 0) {
      outro('Nothing to do here. Cheers! 🎉')
      return
    }

    outro("Let's roll")

    const executorResults = await executors.reduce(
      (executorsChain, executor) =>
        executorsChain.then((executorResults) =>
          executor(toolbox).then((result) => [...executorResults, result])
        ),
      Promise.resolve([])
    )

    const usedFlags = executorResults.join(' ')

    toolbox.print.success(
      `We're all set 🎉.\nNext time you can use silent command: npx create-react-native-ci-cli --${SKIP_INTERACTIVE_COMMAND} ${usedFlags}.`
    )
  },
}

module.exports = command
