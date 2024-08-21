import { print } from 'gluegun'
import {
  outro as clackOutro,
  intro as clackIntro,
  multiselect as clackMultiselect,
  isCancel,
  log as clackLog,
} from '@clack/prompts'
import { CycliToolbox } from '../types'
import { ConfirmPrompt } from '@clack/core'

interface Spinner {
  stop: () => void
}

const COLORS = {
  cyan: print.colors.cyan,
  green: print.colors.green,
  yellow: print.colors.yellow,
  gray: print.colors.gray,
  red: print.colors.red,
  inverse: print.colors.inverse,
  dim: print.colors.dim,
  strikethrough: print.colors.strikethrough,
  bold: print.colors.bold,
}

type MessageColor = keyof typeof COLORS

module.exports = (toolbox: CycliToolbox) => {
  const { cyan, yellow, gray, red, inverse, dim, strikethrough, bold } = COLORS

  const S_STEP_ERROR = yellow('▲')
  const S_SUCCESS = cyan('◆')
  const S_STEP_CANCEL = red('■')
  const S_BAR = '│'
  const S_BAR_END = '└'
  const S_RADIO_ACTIVE = '●'
  const S_RADIO_INACTIVE = '○'

  const confirm = async (
    message: string,
    type: 'normal' | 'warning' = 'normal'
  ): Promise<boolean> => {
    const active = 'Yes'
    const inactive = 'No'

    const title = () => {
      switch (type) {
        case 'normal':
          return `${gray(S_BAR)}\n${S_SUCCESS}  ${message
            .split('\n')
            .join(`\n${S_BAR}  `)}\n`
        case 'warning':
          return `${gray(S_BAR)} \n${S_STEP_ERROR}  ${yellow(
            message.split('\n').join(`\n${S_BAR}  `)
          )}\n`
      }
    }

    const titleSubmitted = () => {
      switch (type) {
        case 'normal':
          return `${gray(S_BAR)} \n${S_SUCCESS}  ${message
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
          return cyan(msg)
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

  const multiselect = async (
    message: string,
    options: { label: string; value: string }[]
  ): Promise<string[]> => {
    const selected = await clackMultiselect({ message: bold(message), options })

    if (isCancel(selected)) {
      throw Error('The script execution has been canceled by the user.')
    }

    return selected as string[]
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
    confirm,
    multiselect,
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
    multiselect: (
      message: string,
      options: { label: string; value: string }[]
    ) => Promise<string[]>
    confirm: (message: string, type?: 'normal' | 'warning') => Promise<boolean>
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
