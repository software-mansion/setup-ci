import { S_ACTION_BULLET } from '../constants'
import { CycliToolbox } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const furtherActions: string[] = []

  const push = (action: string) => {
    furtherActions.push(action)
  }

  const print = () => {
    if (furtherActions.length > 0) {
      toolbox.interactive.vspace()
      toolbox.interactive.sectionHeader('What next?', { color: 'cyan' })
      furtherActions.forEach((action, index) => {
        if (index > 0) {
          toolbox.interactive.vspace()
        }
        toolbox.interactive.info(`${S_ACTION_BULLET} ${action}`, 'cyan')
      })
      toolbox.interactive.sectionFooter({ color: 'cyan' })
      toolbox.interactive.vspace()
    }
  }

  toolbox.furtherActions = {
    push,
    print,
  }
}

export interface FurtherActionsExtension {
  furtherActions: {
    push: (action: string) => void
    print: () => void
  }
}
