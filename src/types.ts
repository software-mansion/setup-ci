import { GluegunToolbox } from 'gluegun/build/types/domain/toolbox'
import { DependenciesExtension } from './extensions/dependencies'
import { InteractiveExtension } from './extensions/interactive'
import { ContextExtension } from './extensions/context'
import { ScriptsExtension } from './extensions/scripts'
import { WorkflowsExtension } from './extensions/workflows'
import { ProjectConfigExtension } from './extensions/projectConfig'
import { COLORS, CYCLI_ERROR_NAME, LOCK_FILE_TO_MANAGER } from './constants'
import { DiffExtension } from './extensions/diff'
import { OptionsExtension } from './extensions/options'
import { FurtherActionsExtension } from './extensions/furtherActions'
import { ExpoExtension } from './extensions/expo'
import { PrettierExtension } from './extensions/prettier'
import { TelemetryExtension } from './extensions/telemetry'
import { ConfigExtension } from './extensions/config'

export enum CycliRecipeFlag {
  ESLINT = 'lint',
  JEST = 'jest',
  TYPESCRIPT = 'ts',
  PRETTIER = 'prettier',
  DETOX = 'detox',
  MAESTRO = 'maestro',
  EAS = 'eas',
}

export interface RecipeMeta {
  name: string
  flag: CycliRecipeFlag
  description: string
  selectHint: string
}

export interface CycliRecipe {
  meta: RecipeMeta
  execute: (toolbox: CycliToolbox) => Promise<void>
  validate?: (toolbox: CycliToolbox) => void
}

export const CycliError = (message: string): Error => {
  const error = new Error(message)
  error.name = CYCLI_ERROR_NAME
  return error
}

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
  engines?: {
    node?: string
  }
  volta?: {
    node?: string
  }
}

export type LockFile = keyof typeof LOCK_FILE_TO_MANAGER

export type PackageManager =
  (typeof LOCK_FILE_TO_MANAGER)[keyof typeof LOCK_FILE_TO_MANAGER]

export type RunResult = ((toolbox: CycliToolbox) => Promise<string>) | null

export type Platform = 'android' | 'ios'
export type Environment = 'development'

export interface AppJson {
  expo?: {
    slug?: string
    plugins?: string[]
    ios?: {
      bundleIdentifier?: string
    }
    android?: {
      package?: string
    }
  }
}

export type CycliToolbox = {
  [K in keyof GluegunToolbox as K extends `${infer _}`
    ? K
    : never]: GluegunToolbox[K]
} & DependenciesExtension &
  InteractiveExtension &
  ConfigExtension &
  ProjectConfigExtension &
  ContextExtension &
  ScriptsExtension &
  OptionsExtension &
  WorkflowsExtension &
  DiffExtension &
  FurtherActionsExtension &
  ExpoExtension &
  PrettierExtension &
  TelemetryExtension
