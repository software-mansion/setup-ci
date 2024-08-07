export const SKIP_INTERACTIVE_FLAG = 'silent'

export const LOCK_FILE_TO_MANAGER = {
  ['yarn.lock']: 'yarn',
  ['package-lock.json']: 'npm',
} as const
