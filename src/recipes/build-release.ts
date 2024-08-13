import { CycliToolbox, Platform, ProjectContext } from '../types'
import { join } from 'path'

const createReleaseBuildWorkflowAndroid = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<string[]> => {
  const furtherActions = await toolbox.scripts.add(
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

  return furtherActions
}

const createReleaseBuildWorkflowIOs = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<string[]> => {
  const iOSAppName = toolbox.filesystem
    .list('ios')
    ?.find((file) => file.endsWith('.xcworkspace'))
    ?.replace('.xcworkspace', '')

  if (!iOSAppName) {
    throw Error(
      [
        'Failed to obtain iOS app name. Is there a ios/ directory without .xcworkspace file in your project?',
        'If so, try running "npx expo prebuild --clean" manually and try again.',
      ].join('\n')
    )
  }

  const furtherActions = await toolbox.scripts.add(
    'build:release:ios',
    [
      `npx expo prebuild --${context.packageManager} &&`,
      'xcodebuild ONLY_ACTIVE_ARCH=YES',
      `-workspace ios/${iOSAppName}.xcworkspace`,
      '-UseNewBuildSystem=YES',
      `-scheme ${iOSAppName}`,
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
      iOSAppName: iOSAppName,
    }
  )

  toolbox.interactive.step('Created iOS release build workflow for Expo.')

  return furtherActions
}

export const createReleaseBuildWorkflowsForExpo = async (
  toolbox: CycliToolbox,
  context: ProjectContext,
  platforms: Platform[]
): Promise<string[]> => {
  const furtherActions: string[] = []

  const existsAndroidDir = toolbox.filesystem.exists('android')
  const existsIOsDir = toolbox.filesystem.exists('ios')

  toolbox.print.info('⚙️ Running expo prebuild to setup app.json properly.')
  await toolbox.system.spawn(`npx expo prebuild --${context.packageManager}`, {
    stdio: 'inherit',
  })

  if (platforms.includes('android')) {
    furtherActions.push(
      ...(await createReleaseBuildWorkflowAndroid(toolbox, context))
    )
  }

  if (platforms.includes('ios')) {
    furtherActions.push(
      ...(await createReleaseBuildWorkflowIOs(toolbox, context))
    )
  }

  const spinner = toolbox.print.spin('🧹 Cleaning up expo prebuild.')

  if (!existsAndroidDir) toolbox.filesystem.remove('android')
  if (!existsIOsDir) toolbox.filesystem.remove('ios')

  spinner.stop()

  return furtherActions
}
