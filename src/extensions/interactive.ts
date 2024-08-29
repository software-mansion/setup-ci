import { print } from 'gluegun'
import {
  outro as clackOutro,
  intro as clackIntro,
  isCancel,
  log as clackLog,
} from '@clack/prompts'
import { CycliToolbox, MessageColor } from '../types'
import { ConfirmPrompt, SelectPrompt } from '@clack/core'
import { spawn } from 'child_process'
import {
  COLORS,
  S_ACTION,
  S_BAR,
  S_BAR_END,
  S_CONFIRM,
  S_DL,
  S_DR,
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
  S_STEP_ERROR,
  S_STEP_SUCCESS,
  S_STEP_WARNING,
  S_SUCCESS,
  S_UL,
  S_UR,
  S_VBAR,
} from '../constants'

interface Spinner {
  stop: () => void
}

const DEFAULT_HEADER_WIDTH = 80

module.exports = (toolbox: CycliToolbox) => {
  const {
    bold,
    cyan,
    magenta,
    yellow,
    gray,
    green,
    inverse,
    dim,
    strikethrough,
  } = COLORS

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

    if (toolbox.options.isNonInteractive()) {
      toolbox.interactive.info(titleSubmitted)
      return
    }

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
          return `${gray(S_BAR)}\n${S_CONFIRM}  ${message
            .split('\n')
            .join(`\n${S_BAR}  `)}\n`
        case 'warning':
          return `${gray(S_BAR)} \n${S_STEP_WARNING}  ${yellow(
            message.split('\n').join(`\n${S_BAR}  `)
          )}\n`
      }
    }

    const titleSubmitted = () => {
      switch (type) {
        case 'normal': {
          return `${gray(S_BAR)} \n${S_CONFIRM}  ${message
            .split('\n')
            .join(`\n${gray(S_BAR)}  `)}\n`
        }
        case 'warning': {
          return `${gray(S_BAR)} \n${S_STEP_WARNING}  ${message
            .split('\n')
            .map((line) => yellow(line))
            .join(`\n${gray(S_BAR)}  `)}\n`
        }
      }
    }

    const titleCancelled = () => {
      switch (type) {
        case 'normal':
          return `${gray(S_BAR)} \n${S_STEP_ERROR}  ${message
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
    print.info(`${S_STEP_SUCCESS} ${message} `)
  }

  const error = (message: string) => {
    print.error(`${S_STEP_ERROR} ${message} `)
  }

  const success = (message: string) => {
    print.info(`${S_SUCCESS} ${green(message)}`)
  }

  const warning = (message: string) => {
    print.warning(`${S_STEP_WARNING} ${message} `)
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

  const sectionHeader = (
    title: string,
    {
      width = DEFAULT_HEADER_WIDTH,
      color,
    }: { width?: number; color?: MessageColor } = {}
  ) => {
    const headerMessage = `${S_UL}${S_VBAR.repeat(
      Math.floor((width - title.length - 3) / 2)
    )} ${bold(title)} ${S_VBAR.repeat(
      Math.ceil((width - title.length - 3) / 2)
    )}`
    info(headerMessage, color)
    info(`${S_DR}`, color)
  }

  const sectionFooter = ({
    width = DEFAULT_HEADER_WIDTH,
    color,
  }: { width?: number; color?: MessageColor } = {}) => {
    info(`${S_UR}\n${S_DL}${S_VBAR.repeat(width - 1)}`, color)
  }

  const spawnSubprocess = async (
    processName: string,
    command: string,
    { alwaysPrintStderr = false }: { alwaysPrintStderr?: boolean } = {}
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      vspace()
      sectionHeader(`Running ${processName}...`, { color: 'dim' })

      const subprocess = spawn(command, {
        stdio: ['inherit', 'inherit', alwaysPrintStderr ? 'inherit' : 'pipe'],
        shell: true,
      })

      step(`Started ${processName}.`)

      let stderr = ''

      if (!alwaysPrintStderr) {
        subprocess.stderr?.on('data', (data) => {
          stderr += data.toString()
        })
      }

      subprocess.on('close', (code) => {
        if (code !== 0) {
          error(`${processName} exited with code ${code}.`)

          if (!alwaysPrintStderr && stderr) {
            info(`\nstderr: ${stderr}`, 'red')
          }
        } else {
          step(`Finished running ${processName}.`)
        }

        sectionFooter({ color: 'dim' })
        vspace()

        if (code !== 0) {
          reject(
            new Error(
              `Failed to execute ${command}. The subprocess exited with code ${code}.`
            )
          )
        } else {
          resolve()
        }
      })

      subprocess.on('error', (err) => {
        reject(err)
      })
    })
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
    sectionHeader,
    sectionFooter,
    spawnSubprocess,
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
    sectionHeader: (
      title: string,
      options?: { width?: number; color?: MessageColor }
    ) => void
    sectionFooter: (options?: { width?: number; color?: MessageColor }) => void
    spawnSubprocess: (
      processName: string,
      command: string,
      options?: { alwaysPrintStderr?: boolean }
    ) => Promise<void>
  }
}
