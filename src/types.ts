export type PackageManager = 'yarn' | 'npm'

export interface ProjectContext {
  packageManager: PackageManager
  monorepoRoot: string | null
  packageRoot: string
}
