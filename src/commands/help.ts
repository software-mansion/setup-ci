import { GluegunCommand, GluegunToolbox } from 'gluegun'
import { CycliCommand } from './setup-ci'
import { HELP_FLAG } from '../constants'

module.exports = {
  name: HELP_FLAG,
  run: async (toolbox: GluegunToolbox, cycliCommand: CycliCommand) => {
    const {
      print: {
        colors: { bold, underline, gray, cyan, green },
      },
      interactive,
      meta,
    } = toolbox

    interactive.vspace()
    interactive.info(
      bold(green(`Welcome to ${cycliCommand.name} ${meta.version()}!`))
    )
    interactive.vspace()
    interactive.info(gray(cycliCommand.description))
    interactive.vspace()
    interactive.info(
      `${bold(underline('Usage:'))} ${cycliCommand.name} [FLAGS]`
    )
    interactive.vspace()
    interactive.info(bold(underline('Flags:')))

    const maxFlagLength = Math.max(
      ...[...cycliCommand.options, ...cycliCommand.featureOptions].map(
        (op) => op.flag.length + 2
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

    interactive.vspace()
    interactive.info(
      'Use any combination of the following with --preset flag to specify your own set of workflows to generate'
    )
    interactive.vspace()
    interactive.info(bold(underline('Feature flags:')))

    for (const option of cycliCommand.featureOptions) {
      toolbox.interactive.info(
        '  ' +
          cyan(`--${option.flag}`.padEnd(maxFlagLength + 2, ' ')) +
          '\t' +
          option.description
      )
    }

    interactive.vspace()
  },
}

export type HelpCommand = GluegunCommand & {
  run: (toolbox: GluegunToolbox, cycliCommand: CycliCommand) => Promise<void>
}
