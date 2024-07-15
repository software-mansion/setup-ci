export type PackageManager = 'yarn' | 'npm'

export interface ProjectContext {
  packageManager: PackageManager
  repoRoot: string
  packageRoot: string
}
