export const HELP_FLAG = 'help'
export const PRESET_FLAG = 'preset'

export const LOCK_FILE_TO_MANAGER = {
  ['yarn.lock']: 'yarn',
  ['package-lock.json']: 'npm',
} as const

const REPOSITORY_URL =
  'https://github.com/software-mansion-labs/react-native-ci-cli'
export const REPOSITORY_SECRETS_HELP_URL = `${REPOSITORY_URL}?tab=readme-ov-file#-repository-secrets`
