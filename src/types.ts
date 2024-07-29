export type PackageManager = 'yarn' | 'npm'

export type Platform = 'android' | 'ios'

export interface ExpoConfig {
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
  expoConfigJson?: ExpoConfig
  iOsAppName?: string
}
