import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { DependenciesExtension } from './extensions/dependencies'
import { InteractiveExtension } from './extensions/interactive'
import { ProjectContextExtension } from './extensions/projectContext'
import { ScriptsExtension } from './extensions/scripts'
import { WorkflowsExtension } from './extensions/workflows'
import { ProjectConfigExtension } from './extensions/projectConfig'
import { COLORS, LOCK_FILE_TO_MANAGER } from './constants'
import { DiffExtension } from './extensions/diff'
import { OptionsExtension } from './extensions/options'
import { FurtherActionsExtension } from './extensions/furtherActions'
import { ExpoExtension } from './extensions/expo'

export type MessageColor = keyof typeof COLORS

export interface PackageJson {
  name: string
  dependencies?: {
    [key: string]: string
  }
  devDependencies?: {
    [key: string]: string
  }
  eslintConfig?: unknown
  jest?: unknown
  prettier?: unknown
  workspaces?: string[]
}

export type LockFile = keyof typeof LOCK_FILE_TO_MANAGER

export type PackageManager =
  (typeof LOCK_FILE_TO_MANAGER)[keyof typeof LOCK_FILE_TO_MANAGER]

export type RunResult =
  | ((toolbox: CycliToolbox, context: ProjectContext) => Promise<string>)
  | null

export interface RecipeMeta {
  name: string
  flag: string
  description: string
  selectHint: string
}

export interface CycliRecipe {
  meta: RecipeMeta
  execute: (toolbox: CycliToolbox, context: ProjectContext) => Promise<void>
  validate?: (toolbox: CycliToolbox) => void
}

export type Platform = 'android' | 'ios'
export type Environment = 'development'

export interface AppJson {
  expo?: {
    plugins?: string[]
  }
}

export interface ProjectContext {
  packageManager: PackageManager
  path: {
    repoRoot: string
    packageRoot: string
    repoFolderName: string
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
  ProjectConfigExtension &
  ProjectContextExtension &
  ScriptsExtension &
  OptionsExtension &
  WorkflowsExtension &
  DiffExtension &
  FurtherActionsExtension &
  ExpoExtension
