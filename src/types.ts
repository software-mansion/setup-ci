import { Toolbox } from 'gluegun/build/types/domain/toolbox'

export type PackageManager = 'yarn' | 'npm'

export interface Option {
  flag: string
  description: string
}

export interface CycliRecipe {
  option: Option
  run: (
    toolbox: Toolbox,
    context: ProjectContext
  ) => Promise<
    (toolbox: Toolbox, context: ProjectContext) => Promise<string> | null
  >
}

export interface ProjectContext {
  packageManager: PackageManager
  path: {
    repoRoot: string
    packageRoot: string
    relFromRepoRoot: (p: string) => string
    absFromRepoRoot: (...p: string[]) => string
  }
  selectedOptions: string[]
}
