import { CycliToolbox } from '../types'

const box = require('ascii-box').box

module.exports = (toolbox: CycliToolbox) => {
  const furtherActions: string[] = []

  const push = (action: string) => {
    furtherActions.push(action)
  }

  const print = () => {
    if (furtherActions.length > 0) {
      toolbox.interactive.vspace()

      toolbox.interactive.info(
        `${box(
          `=== What next?\n\n${furtherActions
            .map((action) => `● ${action}`)
            .join('\n\n')}`,
          { border: 'round', maxWidth: 90 }
        )}
  `,
        'cyan'
      )
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
