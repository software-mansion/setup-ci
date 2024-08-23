import { terminalHyperlink } from './utils/terminalHyperlink'

export const HELP_FLAG = 'help'
export const PRESET_FLAG = 'preset'

export const LOCK_FILE_TO_MANAGER = {
  ['yarn.lock']: 'yarn',
  ['package-lock.json']: 'npm',
} as const

const REPOSITORY_URL =
  'https://github.com/software-mansion-labs/react-native-ci-cli'
const REPOSITORY_SECRETS_HELP_URL = `${REPOSITORY_URL}?tab=readme-ov-file#-repository-secrets`

export const REPOSITORY_SECRETS_HELP_LINK = terminalHyperlink(
  'Repository secrets readme',
  REPOSITORY_SECRETS_HELP_URL
)
