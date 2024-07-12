import {
  confirm as clackConfirm,
  outro as clackOutro,
  intro as clackIntro,
} from '@clack/prompts'
import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const confirm = async (message: string) => {
    return clackConfirm({ message })
  }

  const intro = (message: string) => {
    clackIntro(message)
  }

  const outro = (message: string) => {
    clackOutro(message)
  }

  toolbox.interactive = { confirm, intro, outro }
}
