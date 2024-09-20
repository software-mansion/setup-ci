import { print } from 'gluegun'
import {
  outro as clackOutro,
  intro as clackIntro,
  isCancel,
  log as clackLog,
} from '@clack/prompts'
import { ConfirmPrompt, MultiSelectPrompt, SelectPrompt } from '@clack/core'
import { execSync } from 'child_process'

import {
  COLORS,
  S_ACTION,
  S_BAR,
  S_BAR_END,
  S_CONFIRM,
  S_DL,
  S_DR,
  S_MULTISELECT_MESSAGE,
  S_R_ARROW,
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
  S_STEP_CANCEL,
  S_STEP_SUCCESS,
  S_STEP_WARNING,
  S_SUCCESS,
  S_UL,
  S_UR,
  S_VBAR,
} from '../constants'
import { CycliError, CycliToolbox, MessageColor } from '../types'

const CYCLI_ERROR_CANCEL = CycliError(
  'The script execution has been canceled by the user.'
)
const DEFAULT_HEADER_WIDTH = 80

interface Spinner {
  stop: () => void
}

module.exports = (toolbox: CycliToolbox) => {
  const {
    blue,
    bgWhite,
    bold,
    cyan,
    dim,
    gray,
    inverse,
    reset,
    strikethrough,
    yellow,
    magenta,
    red,
    green,
  } = COLORS

  const withNewlinePrefix = (message: string, prefix: string): string =>
    message.split('\n').join(`\n${prefix} `)

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
      withNewlinePrefix(message, `${S_BAR} `)
    )}\n`

    const titleSubmitted = `${gray(S_BAR)}\n${S_ACTION}  ${withNewlinePrefix(
      message
        .split('\n')
        .map((line) => cyan(line))
        .join('\n'),
      `${dim(S_BAR)} `
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
            )}\n${gray(S_BAR)}`
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
      throw CYCLI_ERROR_CANCEL
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
            .join(`\n${magenta(S_BAR)}  `)}\n`
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
      throw CYCLI_ERROR_CANCEL
    }

    return Boolean(confirmed)
  }

  const multiselect = async (
    message: string,
    hint: string,
    options: { label: string; value: string; hint: string; disabled: boolean }[]
  ): Promise<string[]> => {
    const opt = (
      option: {
        label: string
        value: string
        hint: string
        disabled: boolean
      },
      state: 'inactive' | 'active' | 'selected' | 'active-selected'
    ) => {
      const { label, hint, disabled } = option

      if (disabled) {
        return dim(`${S_RADIO_ACTIVE} ${label} (${hint})`)
      }

      switch (state) {
        case 'active': {
          return `${blue(S_RADIO_INACTIVE)} ${bold(label)} ${dim(`(${hint})`)}`
        }
        case 'selected': {
          return `${blue(S_RADIO_ACTIVE)} ${dim(label)}`
        }
        case 'active-selected': {
          return `${blue(S_RADIO_ACTIVE)} ${label} ${dim(`(${hint})`)}`
        }
        case 'inactive': {
          return `${dim(blue(S_RADIO_INACTIVE))} ${dim(label)}`
        }
      }
    }

    const instruction = reset(
      dim(
        `Press ${gray(bgWhite(inverse(' space ')))} to select, ${gray(
          bgWhite(inverse(' enter '))
        )} to submit`
      )
    )

    const enabledOptions = options.filter((option) => !option.disabled)

    const multiselectPromise = new MultiSelectPrompt({
      options: enabledOptions,
      initialValues: [],
      required: true,
      cursorAt: options[0].value,
      validate(selected: string[]) {
        if (this.required && selected.length === 0)
          return 'Please select at least one option.'
      },
      render() {
        const title = `${gray(S_BAR)}\n${S_MULTISELECT_MESSAGE}  ${bold(
          message
        )}\n${
          ['submit', 'cancel'].includes(this.state) ? gray(S_BAR) : blue(S_BAR)
        }  ${dim(hint)}\n`

        const styleOption = (
          option: {
            value: string
            label: string
            hint: string
            disabled: boolean
          },
          active: boolean
        ) => {
          const selected = this.value.includes(option.value)
          if (active && selected) {
            return opt(option, 'active-selected')
          }
          if (selected) {
            return opt(option, 'selected')
          }
          return opt(option, active ? 'active' : 'inactive')
        }

        const optionsList =
          title +
          `${blue(S_BAR)}\n` +
          blue(S_BAR) +
          '  ' +
          options
            .map((option) => {
              const indexInEnabled = enabledOptions.indexOf(option)
              if (indexInEnabled === -1) {
                return styleOption(option, false)
              }
              return styleOption(option, this.cursor === indexInEnabled)
            })
            .join(`\n${blue(S_BAR)}  `) +
          '\n'

        const selectedOptions = this.options.filter(({ value }) =>
          this.value.includes(value)
        )

        const selectedInfo = `${blue(S_R_ARROW)} ${dim(
          `Selected: ${selectedOptions
            .map((option) => option.label)
            .join(', ')}`
        )}`

        switch (this.state) {
          case 'submit': {
            return `${title}${gray(S_BAR)} \n${gray(S_BAR)}  ${selectedInfo} `
          }
          case 'cancel': {
            const strikethroughSelected =
              selectedOptions.length === 0
                ? ''
                : `\n${gray(S_BAR)}  ${strikethrough(
                    dim(
                      selectedOptions.map((option) => option.label).join(', ')
                    )
                  )}\n${gray(S_BAR)}`
            return `${title}${gray(S_BAR)}${strikethroughSelected}`
          }
          case 'error': {
            const footer = this.error
              .split('\n')
              .map((ln, i) =>
                i === 0 ? `${S_STEP_WARNING} ${yellow(ln)} ` : `   ${ln} `
              )
              .join('\n')

            return `${optionsList}${blue(S_BAR)} \n${blue(
              S_BAR
            )}  ${footer} \n${blue(S_BAR_END)} \n${instruction} `
          }
          default: {
            return `${optionsList}${blue(S_BAR)} \n${blue(
              S_BAR
            )}  ${selectedInfo} \n${blue(S_BAR_END)} \n${instruction} `
          }
        }
      },
    }).prompt() as Promise<string[] | symbol>

    const selected = await multiselectPromise

    if (isCancel(selected)) {
      throw CYCLI_ERROR_CANCEL
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
    if (color) print.info(`${COLORS[color](message)} `)
    else print.info(message)
  }

  const vspace = () => info('')

  const step = (message: string) => {
    print.info(`${S_STEP_SUCCESS} ${message} `)
  }

  const error = (message: string) => {
    print.error(`${S_STEP_CANCEL} ${withNewlinePrefix(message, red('│'))}`)
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

  const spawnSubprocess = (
    processName: string,
    command: string,
    { alwaysPrintStderr = false }: { alwaysPrintStderr?: boolean } = {}
  ) => {
    vspace()
    sectionHeader(`Running ${processName}...`, { color: 'dim' })

    try {
      execSync(command, {
        stdio: ['inherit', 'inherit', alwaysPrintStderr ? 'inherit' : 'pipe'],
      })
      step(`Finished running ${processName}.`)
    } catch (e: unknown) {
      if (!e || typeof e !== 'object' || !('status' in e)) {
        error(`${processName} exited with an unknown error.`)
        throw CycliError(`Failed to execute command ${COLORS.bold(command)}.`)
      }

      error(`${processName} exiter with error status code ${e.status}.`)

      if (
        'stderr' in e &&
        (typeof e.stderr === 'string' || e.stderr instanceof Buffer)
      ) {
        const stderr = e.stderr.toString()
        if (!alwaysPrintStderr && stderr) {
          info(stderr, 'red')
        }
      }

      throw CycliError(
        `Failed to execute command ${COLORS.bold(
          command
        )}.\nThe subprocess exited with code ${e.status}.`
      )
    } finally {
      sectionFooter({ color: 'dim' })
      vspace()
    }
  }

  toolbox.interactive = {
    actionPrompt,
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
    sectionHeader,
    sectionFooter,
    spawnSubprocess,
  }
}

export interface InteractiveExtension {
  interactive: {
    multiselect: (
      message: string,
      hint: string,
      options: {
        label: string
        value: string
        hint: string
        disabled: boolean
      }[]
    ) => Promise<string[]>
    confirm: (
      message: string,
      options: { type: 'normal' | 'warning' }
    ) => Promise<boolean>
    actionPrompt: (message: string) => Promise<void>
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
    ) => void
  }
}
