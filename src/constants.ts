import { PackageManager, LockFile } from './types'

export const SKIP_INTERACTIVE_FLAG = 'silent'

export const LOCK_FILE_TO_MANAGER: { [file in LockFile]: PackageManager } = {
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
}
