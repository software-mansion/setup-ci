import { print } from 'gluegun'
import {
  outro as clackOutro,
  intro as clackIntro,
  isCancel,
  log as clackLog,
} from '@clack/prompts'
import { CycliToolbox } from '../types'
import { ConfirmPrompt, SelectPrompt } from '@clack/core'

interface Spinner {
  stop: () => void
}

const COLORS = {
  cyan: print.colors.cyan,
  magenta: print.colors.magenta,
  green: print.colors.green,
  yellow: print.colors.yellow,
  gray: print.colors.gray,
  red: print.colors.red,
  inverse: print.colors.inverse,
  dim: print.colors.dim,
  strikethrough: print.colors.strikethrough,
}

type MessageColor = keyof typeof COLORS

module.exports = (toolbox: CycliToolbox) => {
  const { cyan, magenta, yellow, gray, red, inverse, dim, strikethrough } =
    COLORS

  const S_ACTION = cyan('▼')
  const S_STEP_ERROR = yellow('▲')
  const S_CONFIRM = magenta('◆')
  const S_STEP_CANCEL = red('■')
  const S_BAR = '│'
  const S_BAR_END = '└'
  const S_RADIO_ACTIVE = '●'
  const S_RADIO_INACTIVE = '○'

  const withNewlinePrefix = (message: string, prefix: string): string =>
    message.split('\n').join(`\n${prefix}  `)

  const actionPrompt = async (message: string): Promise<void> => {
    const opt = (
      option: { value: string; label?: string; hint?: string },
      state: 'inactive' | 'active' | 'selected' | 'cancelled'
    ) => {
      const label = option.label ?? String(option.value)
      switch (state) {
        case 'selected':
          return `${dim(label)}`
        case 'active':
          return `${cyan(S_RADIO_ACTIVE)} ${label} ${
            option.hint ? dim(`(${option.hint})`) : ''
          }`
        case 'cancelled':
          return `${strikethrough(dim(label))}`
        default:
          return `${dim(S_RADIO_INACTIVE)} ${dim(label)}`
      }
    }

    const title = `${gray(S_BAR)}\n${S_ACTION}  ${cyan(
      withNewlinePrefix(message, S_BAR)
    )}\n`

    const titleSubmitted = `${gray(S_BAR)}\n${S_ACTION}  ${withNewlinePrefix(
      message
        .split('\n')
        .map((line) => cyan(line))
        .join('\n'),
      dim(S_BAR)
    )}\n`

    const confirmed = await new SelectPrompt({
      options: [
        {
          value: 'continue',
          label: 'Press enter to continue...',
        },
      ],
      initialValue: 'continue',
      render() {
        switch (this.state) {
          case 'submit':
            return `${titleSubmitted}${gray(S_BAR)}  ${opt(
              this.options[0],
              'selected'
            )}`
          case 'cancel':
            return `${titleSubmitted}${gray(S_BAR)}  ${opt(
              this.options[0],
              'cancelled'
            )}\n${gray(S_BAR)}`
          default: {
            return `${title}${cyan(S_BAR)}  ${opt(
              this.options[0],
              'active'
            )}\n${cyan(S_BAR_END)}`
          }
        }
      },
    }).prompt()

    if (isCancel(confirmed)) {
      throw Error('The script execution has been canceled by the user.')
    }
  }

  const confirm = async (
    message: string,
    { type }: { type: 'normal' | 'warning' }
  ): Promise<boolean> => {
    const active = 'Yes'
    const inactive = 'No'

    const title = () => {
      switch (type) {
        case 'normal':
          return `${gray(S_BAR)}\n${S_CONFIRM}  ${withNewlinePrefix(
            message,
            S_BAR
          )}\n`
        case 'warning':
          return `${gray(S_BAR)} \n${S_STEP_ERROR}  ${yellow(
            withNewlinePrefix(message, S_BAR)
          )}\n`
      }
    }

    const titleSubmitted = () => {
      switch (type) {
        case 'normal':
          return `${gray(S_BAR)} \n${S_CONFIRM}  ${message
            .split('\n')
            .join(`\n${gray(S_BAR)}  `)}\n`
        case 'warning':
          return `${gray(S_BAR)} \n${S_STEP_ERROR}  ${message
            .split('\n')
            .map((line) => yellow(line))
            .join(`\n${gray(S_BAR)}  `)}\n`
      }
    }

    const titleCancelled = () => {
      switch (type) {
        case 'normal':
          return `${gray(S_BAR)} \n${S_STEP_CANCEL}  ${message
            .split('\n')
            .join(`\n${gray(S_BAR)}  `)}\n`
        case 'warning':
          return titleSubmitted()
      }
    }

    const typeColor = (msg: string): string => {
      switch (type) {
        case 'normal':
          return magenta(msg)
        case 'warning':
          return yellow(msg)
      }
    }

    const confirmed = await new ConfirmPrompt({
      active,
      inactive,
      initialValue: true,
      render() {
        const value = this.value ? active : inactive

        switch (this.state) {
          case 'submit':
            return `${titleSubmitted()}${gray(S_BAR)}  ${dim(value)}`
          case 'cancel':
            return `${titleCancelled()}${gray(S_BAR)}  ${strikethrough(
              dim(value)
            )}\n${gray(S_BAR)}`
          default: {
            return `${title()}${typeColor(S_BAR)}  ${
              this.value
                ? `${typeColor(S_RADIO_ACTIVE)} ${active}`
                : `${dim(S_RADIO_INACTIVE)} ${dim(active)}`
            } ${dim('/')} ${
              !this.value
                ? `${typeColor(S_RADIO_ACTIVE)} ${inactive}`
                : `${dim(S_RADIO_INACTIVE)} ${dim(inactive)}`
            } \n${typeColor(S_BAR_END)} \n`
          }
        }
      },
    }).prompt()

    if (isCancel(confirmed)) {
      throw Error('The script execution has been canceled by the user.')
    }

    return Boolean(confirmed)
  }

  const surveyStep = (message: string) => {
    clackLog.step(message)
  }

  const surveyWarning = (message: string) => {
    clackLog.warn(yellow(message))
  }

  const info = (message: string, color?: MessageColor) => {
    if (color) print.info(`${COLORS[color](message)}`)
    else print.info(message)
  }

  const vspace = () => info('')

  const step = (message: string) => {
    print.info(`${COLORS.green('✔')} ${message} `)
  }

  const error = (message: string) => {
    print.error(`❗ ${message} `)
  }

  const success = (message: string) => {
    print.success(message)
  }

  const warning = (message: string) => {
    print.warning(`⚠ ${message} `)
  }

  const spin = (message: string): Spinner => {
    return print.spin(message)
  }

  const intro = (message: string) => {
    clackIntro(inverse(message))
  }

  const outro = (message: string) => {
    clackOutro(message)
  }

  toolbox.interactive = {
    actionPrompt,
    confirm,
    surveyStep,
    surveyWarning,
    info,
    vspace,
    step,
    error,
    success,
    warning,
    spin,
    intro,
    outro,
  }
}

export interface InteractiveExtension {
  interactive: {
    actionPrompt: (message: string) => Promise<void>
    confirm: (
      message: string,
      options: { type: 'normal' | 'warning' }
    ) => Promise<boolean>
    surveyStep: (message: string) => void
    surveyWarning: (message: string) => void
    info: (message: string, color?: MessageColor) => void
    vspace: () => void
    step: (message: string) => void
    error: (message: string) => void
    success: (message: string) => void
    warning: (message: string) => void
    spin: (message: string) => Spinner
    intro: (message: string) => void
    outro: (message: string) => void
  }
}
