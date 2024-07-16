import {
  confirm as clackConfirm,
  outro as clackOutro,
  intro as clackIntro,
  isCancel,
} from '@clack/prompts'

import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const { print } = toolbox

  const confirm = async (message: string) => {
    const confirmed = await clackConfirm({ message })

    if (isCancel(confirmed)) {
      throw Error('The script execution has been canceled by the user.')
    }

    return confirmed
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

  const spin = (message: string) => {
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
    step,
    error,
    success,
    warning,
    spin,
    intro,
    outro,
  }
}
