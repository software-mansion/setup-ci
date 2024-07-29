import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { Platform, ProjectContext } from '../types'
import { join } from 'path'

const createReleaseBuildWorkflowAndroid = async (
  toolbox: Toolbox,
  context: ProjectContext
) => {
  await toolbox.scripts.add(
    'build:release:android',
    [
      `npx expo prebuild --${context.packageManager} &&`,
      'cd android &&',
      './gradlew assembleRelease assembleAndroidTest',
    ].join(' ')
  )

  await toolbox.workflows.generate(
    join('build-release', 'build-release-android.ejf'),
    context.path.absFromRepoRoot(
      '.github',
      'workflows',
      'build-release-android.yml'
    ),
    context
  )

  toolbox.interactive.step('Created Android release build workflow for Expo.')
}

const createReleaseBuildWorkflowIOs = async (
  toolbox: Toolbox,
  context: ProjectContext
) => {
  await toolbox.scripts.add(
    'build:release:ios',
    [
      `npx expo prebuild --${context.packageManager} &&`,
      'xcodebuild ONLY_ACTIVE_ARCH=YES',
      `-workspace ios/${context.iOsAppName}.xcworkspace`,
      '-UseNewBuildSystem=YES',
      `-scheme ${context.iOsAppName}`,
      '-configuration Release',
      '-sdk iphonesimulator',
      '-derivedDataPath ios/build',
      '-quiet',
    ].join(' ')
  )

  await toolbox.workflows.generate(
    join('build-release', 'build-release-ios.ejf'),
    context.path.absFromRepoRoot(
      '.github',
      'workflows',
      'build-release-ios.yml'
    ),
    context,
    {
      iOsAppName: context.iOsAppName,
    }
  )

  toolbox.interactive.step('Created iOS release build workflow for Expo.')
}

export const createReleaseBuildWorkflowsForExpo = async (
  toolbox: Toolbox,
  context: ProjectContext,
  platforms: Platform[]
): Promise<void> => {
  const existsAndroidDir = toolbox.filesystem.exists('android')
  const existsIOsDir = toolbox.filesystem.exists('ios')

  if (!context.expoConfigJson?.expo?.android.package) {
    toolbox.print.info('⚙️ Setting up expo prebuild.')
    await toolbox.system.spawn(
      `npx expo prebuild --${context.packageManager}`,
      { stdio: 'inherit' }
    )
    const spinner = toolbox.print.spin('🧹 Cleaning up expo prebuild.')

    if (!existsAndroidDir) toolbox.filesystem.remove('android')
    if (!existsIOsDir) toolbox.filesystem.remove('ios')

    spinner.stop()
  }

  if (platforms.includes('android'))
    await createReleaseBuildWorkflowAndroid(toolbox, context)

  if (platforms.includes('ios'))
    await createReleaseBuildWorkflowIOs(toolbox, context)
}
