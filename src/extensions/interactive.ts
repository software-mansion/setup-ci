import {
  confirm as clackConfirm,
  outro as clackOutro,
  intro as clackIntro,
  isCancel,
} from '@clack/prompts'

import { CycliToolbox } from '../types'

interface Spinner {
  stop: () => void
}

type MessageColor = 'cyan'

module.exports = (toolbox: CycliToolbox) => {
  const {
    print: {
      colors: { cyan, green },
      ...print
    },
  } = toolbox

  const COLORS: { [key in MessageColor]: (message: string) => string } = {
    cyan: cyan,
  }

  const confirm = async (message: string): Promise<boolean> => {
    const confirmed = await clackConfirm({ message })

    if (isCancel(confirmed)) {
      throw Error('The script execution has been canceled by the user.')
    }

    return confirmed
  }

  const info = (message: string, color?: MessageColor) => {
    if (color) print.info(`${COLORS[color](message)}`)
    else print.info(message)
  }

  const vspace = () => info('')

  const step = (message: string) => {
    print.info(`${green('✔')} ${message} `)
  }

  const error = (message: string) => {
    print.error(`❗ ${message}`)
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
    clackIntro(message)
  }

  const outro = (message: string) => {
    clackOutro(message)
  }

  toolbox.interactive = {
    confirm,
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
    confirm: (message: string) => Promise<boolean>
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
