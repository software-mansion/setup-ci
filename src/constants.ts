export const PRESET_FLAG = 'preset'

export const LOCK_FILE_TO_MANAGER = {
  ['yarn.lock']: 'yarn',
  ['package-lock.json']: 'npm',
} as const
