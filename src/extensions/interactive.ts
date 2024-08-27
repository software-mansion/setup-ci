import { print } from 'gluegun'
import {
  outro as clackOutro,
  intro as clackIntro,
  isCancel,
  log as clackLog,
} from '@clack/prompts'
import { CycliToolbox, MessageColor } from '../types'
import { ConfirmPrompt, SelectPrompt, MultiSelectPrompt } from '@clack/core'
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

const COLORS = {
  blue: print.colors.blue,
  bgWhite: print.colors.bgWhite,
  bold: print.colors.bold,
  cyan: print.colors.cyan,
  dim: print.colors.dim,
  gray: print.colors.gray,
  green: print.colors.green,
  inverse: print.colors.inverse,
  red: print.colors.red,
  reset: print.colors.reset,
  strikethrough: print.colors.strikethrough,
  yellow: print.colors.yellow,
}

type MessageColor = keyof typeof COLORS

module.exports = (toolbox: CycliToolbox) => {
  const {
    blue,
    bgWhite,
    bold,
    cyan,
    dim,
    gray,
    inverse,
    red,
    reset,
    strikethrough,
    yellow,
  } = COLORS

  const S_STEP_ERROR = yellow('▲')
  const S_SUCCESS = cyan('◆')
  const S_STEP_CANCEL = red('■')
  const S_MULTISELECT_MESSAGE = blue('◆')
  const S_R_ARROW = '►'
  const S_BAR = '│'
  const S_BAR_END = '└'
  const S_RADIO_ACTIVE = '●'
  const S_RADIO_INACTIVE = '○'

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

  const multiselect = async (
    message: string,
    hint: string,
    options: { label: string; value: string; hint: string }[]
  ): Promise<string[]> => {
    const opt = (
      option: { label: string; value: string; hint?: string },
      state: 'inactive' | 'active' | 'selected' | 'active-selected'
    ) => {
      const { label, hint } = option

      switch (state) {
        case 'active': {
          return `${blue(S_RADIO_INACTIVE)} ${bold(label)} ${
            hint ? dim(`(${hint})`) : ''
          }`
        }
        case 'selected': {
          return `${blue(S_RADIO_ACTIVE)} ${dim(label)}`
        }
        case 'active-selected': {
          return `${blue(S_RADIO_ACTIVE)} ${label} ${
            option.hint ? dim(`(${hint})`) : ''
          }`
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

    const multiselectPromise = new MultiSelectPrompt({
      options,
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
          option: { value: string; label: string; hint?: string },
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
          this.options
            .map((option, index) => styleOption(option, this.cursor === index))
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
                i === 0 ? `${S_STEP_ERROR} ${yellow(ln)} ` : `   ${ln} `
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
    if (color) print.info(`${COLORS[color](message)} `)
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
      options: { label: string; value: string; hint: string }[]
    ) => Promise<string[]>
    confirm: (message: string, type?: 'normal' | 'warning') => Promise<boolean>
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
    ) => Promise<void>
  }
}
