import {
  confirm as clackConfirm,
  outro as clackOutro,
  intro as clackIntro,
  multiselect as clackMultiselect,
  isCancel,
} from '@clack/prompts'

import { CycliToolbox } from '../types'

interface Spinner {
  stop: () => void
}

module.exports = (toolbox: CycliToolbox) => {
  const {
    print: {
      colors: { bold },
      ...print
    },
  } = toolbox

  const confirm = async (message: string): Promise<boolean> => {
    const confirmed = await clackConfirm({ message })

    if (isCancel(confirmed)) {
      throw Error('The script execution has been canceled by the user.')
    }

    return confirmed
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

  const info = (message: string) => {
    print.info(message)
  }

  const step = (message: string) => {
    print.info(`✔ ${message} `)
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
    multiselect,
    info,
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
    multiselect: (
      message: string,
      options: { label: string; value: string }[]
    ) => Promise<string[]>
    info: (message: string) => void
    step: (message: string) => void
    error: (message: string) => void
    success: (message: string) => void
    warning: (message: string) => void
    spin: (message: string) => Spinner
    intro: (message: string) => void
    outro: (message: string) => void
  }
}
