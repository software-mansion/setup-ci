import { CycliToolbox, Platform, ProjectContext } from '../types'
import { join } from 'path'

const createReleaseBuildWorkflowAndroid = async (
  toolbox: CycliToolbox,
  context: ProjectContext,
  { expo }: { expo: boolean }
) => {
  let script =
    'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'

  if (expo) {
    script = `npx expo prebuild --${context.packageManager} && ${script}`
  }

  await toolbox.scripts.add('build:release:android', script)

  await toolbox.workflows.generate(
    join('build-release', 'build-release-android.ejf'),
    context
  )

  toolbox.interactive.success('Created Android release build workflow.')
}

const createReleaseBuildWorkflowIOs = async (
  toolbox: CycliToolbox,
  context: ProjectContext,
  { iOSAppName, expo }: { iOSAppName: string; expo: boolean }
) => {
  let script = [
    'xcodebuild ONLY_ACTIVE_ARCH=YES',
    `-workspace ios/${iOSAppName}.xcworkspace`,
    '-UseNewBuildSystem=YES',
    `-scheme ${iOSAppName}`,
    '-configuration Release',
    '-sdk iphonesimulator',
    '-derivedDataPath ios/build',
    '-quiet',
  ].join(' ')

  if (expo) {
    script = `npx expo prebuild --${context.packageManager} && ${script}`
  } else {
    script = `cd ios && pod install && cd .. && ${script}`
  }

  await toolbox.scripts.add('build:release:ios', script)

  await toolbox.workflows.generate(
    join('build-release', 'build-release-ios.ejf'),
    context,
    {
      iOSAppName: iOSAppName,
    }
  )

  toolbox.interactive.success('Created iOS release build workflow.')
}

export const createReleaseBuildWorkflows = async (
  toolbox: CycliToolbox,
  context: ProjectContext,
  { platforms, expo }: { platforms: Platform[]; expo: boolean }
): Promise<void> => {
  const existsAndroidDir = toolbox.filesystem.exists('android')
  const existsIOsDir = toolbox.filesystem.exists('ios')

  if (expo) {
    toolbox.print.info('⚙️ Running expo prebuild to setup app.json properly.')
    await toolbox.interactive.spawnSubprocess(
      'Expo prebuild',
      `npx expo prebuild --${context.packageManager}`,
      { alwaysPrintStderr: true }
    )
  }

  const iOSAppName = toolbox.filesystem
    .list('ios')
    ?.find((file) => file.endsWith('.xcworkspace'))
    ?.replace('.xcworkspace', '')

  if (!iOSAppName) {
    throw Error(
      'Failed to obtain iOS app name. Perhaps your ios/ directory is missing .xcworkspace file.'
    )
  }

  if (platforms.includes('android')) {
    await createReleaseBuildWorkflowAndroid(toolbox, context, { expo })
  }

  if (platforms.includes('ios')) {
    await createReleaseBuildWorkflowIOs(toolbox, context, { iOSAppName, expo })
  }

  if (!existsAndroidDir) toolbox.filesystem.remove('android')
  if (!existsIOsDir) toolbox.filesystem.remove('ios')
}
