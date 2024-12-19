import { GluegunCommand, GluegunToolbox } from 'gluegun'
import { CycliCommand } from './setup-ci'
import { HELP_FLAG, MAIN_FLAG, PULL_REQUEST_FLAG } from '../constants'

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
        (op) => op.flag.length + 2 + (op.params ? '[...workflows]'.length : 0)
      )
    )

    for (const option of cycliCommand.options) {
      toolbox.interactive.info(
        '  ' +
          cyan(
            (option.params
              ? `-${option.flag} [...workflows]`
              : `--${option.flag}`
            ).padEnd(maxFlagLength + 2, ' ')
          ) +
          '\t' +
          option.description
      )
    }

    interactive.vspace()
    interactive.info(
      `Use any combination of the following with -${PULL_REQUEST_FLAG} and -${MAIN_FLAG} flags to specify your own set of workflows to generate`
    )
    interactive.vspace()
    interactive.info(bold(underline('Available workflows:')))

    for (const option of cycliCommand.featureOptions) {
      toolbox.interactive.info(
        '  ' +
          cyan(option.flag.padEnd(maxFlagLength + 2, ' ')) +
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
