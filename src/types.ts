import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { DependenciesExtension } from './extensions/dependencies'
import { InteractiveExtension } from './extensions/interactive'
import { ProjectContextExtension } from './extensions/projectContext'
import { ScriptsExtension } from './extensions/scripts'
import { SkipInteractiveExtension } from './extensions/skipInteractive'
import { WorkflowsExtension } from './extensions/workflows'
import { ProjectConfigExtension } from './extensions/projectConfig'

export type PackageManager = 'yarn' | 'npm'
export type LockFile = 'yarn.lock' | 'package-lock.json'

export interface PackageJson {
  dependencies?: {
    [key: string]: string
  }
  devDependencies?: {
    [key: string]: string
  }
  workspaces?: string[]
}

export interface ProjectContext {
  packageManager: PackageManager
  path: {
    repoRoot: string
    packageRoot: string
    relFromRepoRoot: (p: string) => string
    absFromRepoRoot: (...p: string[]) => string
  }
}

export type CycliToolbox = {
  [K in keyof GluegunToolbox as K extends `${infer _}`
    ? K
    : never]: GluegunToolbox[K]
} & DependenciesExtension &
  InteractiveExtension &
  ProjectContextExtension &
  ProjectConfigExtension &
  ScriptsExtension &
  SkipInteractiveExtension &
  WorkflowsExtension
