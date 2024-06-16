import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const isGitDirty = require('is-git-dirty') // eslint-disable-line @typescript-eslint/no-var-requires
  toolbox.isGitDirty = (cwd?: string): boolean | null => isGitDirty(cwd)
}
