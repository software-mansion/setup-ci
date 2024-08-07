import { CycliToolbox, Platform, ProjectContext } from '../types'
import { join } from 'path'

const createReleaseBuildWorkflowAndroid = async (
  toolbox: CycliToolbox,
  context: ProjectContext
) => {
  await toolbox.scripts.add(
    'build:release:android',
    [
      `npx expo prebuild --${context.packageManager}`,
      'cd android',
      './gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    ].join(' && ')
  )

  await toolbox.workflows.generate(
    join('build-release', 'build-release-android.ejf'),
    context
  )

  toolbox.interactive.step('Created Android release build workflow for Expo.')
}

const createReleaseBuildWorkflowIOs = async (
  toolbox: CycliToolbox,
  context: ProjectContext
) => {
  if (!context.iOSAppName) {
    throw Error(
      'Failed to obtain iOS app name. Make sure you have field expo.name defined in your app.json.'
    )
  }

  await toolbox.scripts.add(
    'build:release:ios',
    [
      `npx expo prebuild --${context.packageManager} &&`,
      'xcodebuild ONLY_ACTIVE_ARCH=YES',
      `-workspace ios/${context.iOSAppName}.xcworkspace`,
      '-UseNewBuildSystem=YES',
      `-scheme ${context.iOSAppName}`,
      '-configuration Release',
      '-sdk iphonesimulator',
      '-derivedDataPath ios/build',
      '-quiet',
    ].join(' ')
  )

  await toolbox.workflows.generate(
    join('build-release', 'build-release-ios.ejf'),
    context,
    {
      iOSAppName: context.iOSAppName,
    }
  )

  toolbox.interactive.step('Created iOS release build workflow for Expo.')
}

export const createReleaseBuildWorkflowsForExpo = async (
  toolbox: CycliToolbox,
  context: ProjectContext,
  platforms: Platform[]
): Promise<void> => {
  const existsAndroidDir = toolbox.filesystem.exists('android')
  const existsIOsDir = toolbox.filesystem.exists('ios')

  if (!toolbox.projectConfig.appJson()?.expo?.android.package) {
    toolbox.print.info('⚙️ Running expo prebuild to setup app.json properly.')
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
