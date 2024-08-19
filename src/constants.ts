export const PRESET_FLAG = 'preset'

export const LOCK_FILE_TO_MANAGER = {
  ['yarn.lock']: 'yarn',
  ['package-lock.json']: 'npm',
} as const

export const REPOSITORY_SECRETS_HELP_URL =
  'https://github.com/software-mansion-labs/react-native-ci-cli?tab=readme-ov-file#-repository-secrets'
