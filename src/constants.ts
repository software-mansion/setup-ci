import { print } from 'gluegun'

export const CYCLI_COMMAND = 'setup-ci'

export const CYCLI_ERROR_NAME = 'CycliError'

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
  reset: print.colors.reset,
  blue: print.colors.blue,
  bgWhite: print.colors.bgWhite,
}

export const S_STEP_WARNING = COLORS.yellow('▲')
export const S_STEP_CANCEL = COLORS.red('■')
export const S_STEP_SUCCESS = COLORS.green('◇')
export const S_SUCCESS = COLORS.green('◆')
export const S_CONFIRM = COLORS.magenta('◆')
export const S_ACTION = COLORS.cyan('▼')
export const S_ACTION_BULLET = COLORS.cyan('►')
export const S_MULTISELECT_MESSAGE = COLORS.blue('◆')

export const S_BAR = '│'
export const S_VBAR = '─'
export const S_UL = '╭'
export const S_DL = '╰'
export const S_UR = '╮'
export const S_DR = '╯'
export const S_BAR_END = '└'
export const S_RADIO_ACTIVE = '●'
export const S_RADIO_INACTIVE = '○'
export const S_R_ARROW = '►'

export const NON_INTERACTIVE_FLAG = 'non-interactive'
export const HELP_FLAG = 'help'
export const PRESET_FLAG = 'preset'
export const SKIP_TELEMETRY_FLAG = 'skip-telemetry'

export const LOCK_FILE_TO_MANAGER = {
  ['yarn.lock']: 'yarn',
  ['package-lock.json']: 'npm',
  ['bun.lockb']: 'bun',
  ['pnpm-lock.yaml']: 'pnpm',
} as const

export const REPOSITORY_URL = 'https://github.com/software-mansion/setup-ci'
export const REPOSITORY_SECRETS_HELP_URL = `${REPOSITORY_URL}?tab=readme-ov-file#-repository-secrets`
export const REPOSITORY_METRICS_HELP_URL = `${REPOSITORY_URL}?tab=readme-ov-file#%-metrics`
export const REPOSITORY_ISSUES_URL = `${REPOSITORY_URL}/issues`
export const REPOSITORY_TROUBLESHOOTING_URL = `${REPOSITORY_URL}/blob/master/docs/troubleshooting.md`

const DOCS_URL = 'https://docs.swmansion.com/setup-ci/docs'
export const DOCS_WORKFLOWS_URL = `${DOCS_URL}/category/workflows`
