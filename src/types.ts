import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { DependenciesExtension } from './extensions/dependencies'
import { InteractiveExtension } from './extensions/interactive'
import { ProjectContextExtension } from './extensions/projectContext'
import { ScriptsExtension } from './extensions/scripts'
import { SkipInteractiveExtension } from './extensions/skipInteractive'
import { WorkflowsExtension } from './extensions/workflows'

export type PackageManager = 'yarn' | 'npm'
export type LockFile = 'yarn.lock' | 'package-lock.json'

export interface RecipeMeta {
  flag: string
  description: string
}

export interface CycliRecipe {
  meta: RecipeMeta
  run: (
    toolbox: CycliToolbox,
    context: ProjectContext
  ) => Promise<
    ((toolbox: CycliToolbox, context: ProjectContext) => Promise<string>) | null
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

export type CycliToolbox = {
  [K in keyof GluegunToolbox as K extends `${infer _}`
    ? K
    : never]: GluegunToolbox[K]
} & DependenciesExtension &
  InteractiveExtension &
  ProjectContextExtension &
  ScriptsExtension &
  SkipInteractiveExtension &
  WorkflowsExtension
