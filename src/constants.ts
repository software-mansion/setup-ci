import { print } from 'gluegun'

export const CYCLI_COMMAND = 'react-native-ci-cli'

export const COLORS = {
  bold: print.colors.bold,
  cyan: print.colors.cyan,
  magenta: print.colors.magenta,
  green: print.colors.green,
  yellow: print.colors.yellow,
  gray: print.colors.gray,
  red: print.colors.red,
  inverse: print.colors.inverse,
  dim: print.colors.dim,
  strikethrough: print.colors.strikethrough,
  underline: print.colors.underline,
}

export const S_STEP_WARNING = COLORS.yellow('▲')
export const S_STEP_ERROR = COLORS.red('■')
export const S_STEP_SUCCESS = COLORS.green('◇')
export const S_SUCCESS = COLORS.green('◆')
export const S_CONFIRM = COLORS.magenta('◆')
export const S_ACTION = COLORS.cyan('▼')
export const S_ACTION_BULLET = COLORS.cyan('►')
export const S_BAR = '│'
export const S_VBAR = '─'
export const S_UL = '╭'
export const S_DL = '╰'
export const S_UR = '╮'
export const S_DR = '╯'
export const S_BAR_END = '└'
export const S_RADIO_ACTIVE = '●'
export const S_RADIO_INACTIVE = '○'

export const HELP_FLAG = 'help'
export const PRESET_FLAG = 'preset'

export const LOCK_FILE_TO_MANAGER = {
  ['yarn.lock']: 'yarn',
  ['package-lock.json']: 'npm',
  ['bun.lockb']: 'bun',
} as const

const REPOSITORY_URL =
  'https://github.com/software-mansion-labs/react-native-ci-cli'
export const REPOSITORY_SECRETS_HELP_URL = `${REPOSITORY_URL}?tab=readme-ov-file#-repository-secrets`
export const REPOSITORY_ISSUES_URL = `${REPOSITORY_URL}/issues`
