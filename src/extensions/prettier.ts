import { CycliToolbox } from '../types'
import { extname } from 'path'
import { execSync } from 'child_process'

const FORMATTABLE_FILES_EXTENSIONS = ['.js', '.ts', '.json', '.yml']

module.exports = (toolbox: CycliToolbox) => {
  const formatFiles = async (files: string[]) => {
    const spinner = toolbox.interactive.spin(
      'Formatting modified files with Prettier...'
    )

    const prettierCommand =
      'npx prettier --write ' +
      files
        .filter((file) => FORMATTABLE_FILES_EXTENSIONS.includes(extname(file)))
        .join(' ')

    execSync(prettierCommand)

    spinner.stop()
    toolbox.interactive.step('Formatted modified files with Prettier.')
  }

  toolbox.prettier = {
    formatFiles,
  }
}

export interface PrettierExtension {
  prettier: {
    formatFiles: (files: string[]) => void
  }
}
