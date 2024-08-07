import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { DependenciesExtension } from './extensions/dependencies'
import { InteractiveExtension } from './extensions/interactive'
import { ProjectContextExtension } from './extensions/projectContext'
import { ScriptsExtension } from './extensions/scripts'
import { SkipInteractiveExtension } from './extensions/skipInteractive'
import { WorkflowsExtension } from './extensions/workflows'
import { ProjectConfigExtension } from './extensions/projectConfig'
import { LOCK_FILE_TO_MANAGER } from './constants'

export interface PackageJson {
  name: string
  dependencies?: {
    [key: string]: string
  }
  devDependencies?: {
    [key: string]: string
  }
  workspaces?: string[]
}

export type LockFile = keyof typeof LOCK_FILE_TO_MANAGER

export type PackageManager =
  (typeof LOCK_FILE_TO_MANAGER)[keyof typeof LOCK_FILE_TO_MANAGER]

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

export type Platform = 'android' | 'ios'

export interface AppJson {
  expo?: {
    name: string
    plugins?: string[]
    android: {
      package?: string
    }
  }
}

export interface ProjectContext {
  packageManager: PackageManager
  path: {
    repoRoot: string
    packageRoot: string
    relFromRepoRoot: (p: string) => string
    absFromRepoRoot: (...p: string[]) => string
  }
  iOSAppName?: string
  selectedOptions: string[]
}

export type CycliToolbox = {
  [K in keyof GluegunToolbox as K extends `${infer _}`
    ? K
    : never]: GluegunToolbox[K]
} & DependenciesExtension &
  InteractiveExtension &
  ProjectConfigExtension &
  ProjectContextExtension &
  ScriptsExtension &
  SkipInteractiveExtension &
  WorkflowsExtension
