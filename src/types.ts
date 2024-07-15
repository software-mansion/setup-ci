export type PackageManager = 'yarn' | 'npm'

export interface ProjectContext {
  packageManager: PackageManager
}
