import { GluegunCommand } from 'gluegun'
import runLint from '../recipies/lint'
import { intro, outro, confirm } from '@clack/prompts'
import { SKIP_INTERACTIVE_COMMAND } from '../constants'
import isGitDirty from 'is-git-dirty'

const command: GluegunCommand = {
  name: 'react-native-ci-cli',
  run: async (toolbox) => {
    intro('Welcome to React Native CI CLI')

    if (isGitDirty() == null) {
      outro('This is not a git repository. Exiting.')

      return
    }

    if (isGitDirty() == true) {
      const proceed = await confirm({
        message: 'You have uncommitted changes. Do you want to proceed?',
      })

      if (!proceed) {
        outro(
          'Please commit your changes before running this command. Exiting.'
        )
        return
      }
    }

    const lintExecutor = await runLint(toolbox)

    const executors = [lintExecutor].filter(Boolean)

    if (executors.length === 0) {
      outro('Nothing to do here. Cheers! 🎉')
      return
    }

    outro("Let's roll")

    const executorResults = await Promise.all(
      executors.map((executor) => executor(toolbox))
    )

    const usedFlags = executorResults.join(' --')

    toolbox.print.success(
      `We're all set. Next time you can use silent command: npx create-react-native-ci-cli --${SKIP_INTERACTIVE_COMMAND} ${usedFlags}`
    )

    process.exit()
  },
}

module.exports = command
