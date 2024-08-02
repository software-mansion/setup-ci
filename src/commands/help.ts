import { GluegunCommand, GluegunToolbox } from 'gluegun'
import { Option } from '../types'
import { CycliCommand } from './react-native-ci-cli'

module.exports = {
  name: 'help',
  run: async (toolbox: GluegunToolbox, cycliCommand: CycliCommand) => {
    const {
      print: {
        colors: { bold, underline, gray, cyan, green },
      },
      interactive,
      meta,
    } = toolbox

    const vspace = () => interactive.info('')

    vspace()
    interactive.info(
      bold(green(`Welcome to ${cycliCommand.name} ${meta.version()}!`))
    )
    vspace()
    interactive.info(gray(cycliCommand.description))
    vspace()
    interactive.info(
      `${bold(underline('Usage:'))} ${cycliCommand.name} [FLAGS]`
    )
    vspace()
    interactive.info(bold(underline('Flags:')))

    const maxFlagLength = Math.max(
      ...[...cycliCommand.options, ...cycliCommand.featureOptions].map(
        (op: Option) => op.flag.length + 2
      )
    )

    for (const option of cycliCommand.options) {
      toolbox.interactive.info(
        '  ' +
          cyan(`--${option.flag}`.padEnd(maxFlagLength + 2, ' ')) +
          '\t' +
          option.description
      )
    }

    vspace()
    interactive.info(
      'Use the following feature flags in silent mode to specify you own preset of workflows to generate'
    )
    vspace()
    interactive.info(bold(underline('Feature flags:')))

    for (const option of cycliCommand.featureOptions) {
      toolbox.interactive.info(
        '  ' +
          cyan(`--${option.flag}`.padEnd(maxFlagLength + 2, ' ')) +
          '\t' +
          option.description
      )
    }

    vspace()
  },
}

export type HelpCommand = GluegunCommand & {
  run: (toolbox: GluegunToolbox, cycliCommand: CycliCommand) => Promise<void>
}
