import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { Platform, ProjectContext } from '../types'
import { join } from 'path'

const createDebugBuildWorkflowAndroid = async (
  toolbox: Toolbox,
  context: ProjectContext
) => {
  await toolbox.scripts.add(
    'build:debug:android',
    [
      'npx expo prebuild &&',
      'cd android &&',
      './gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    ].join(' ')
  )

  await toolbox.workflows.generate(
    join('build-debug', 'build-debug-android.ejf'),
    context.path.absFromRepoRoot('.github', 'workflows', 'jest.yml'),
    context
  )

  toolbox.interactive.step('Created Android debug build workflow for Expo.')
}

const createDebugBuildWorkflowIOs = async (
  toolbox: Toolbox,
  context: ProjectContext
) => {
  await toolbox.scripts.add(
    'build:debug:ios',
    [
      'npx expo prebuild &&',
      `xcodebuild -workspace ios/${context.iOsAppName}.xcworkspace`,
      `-scheme ${context.iOsAppName}`,
      '-configuration Debug',
      '-sdk iphonesimulator',
      '-derivedDataPath ios/build',
    ].join(' ')
  )

  await toolbox.workflows.generate(
    join('build-debug', 'build-debug-ios.ejf'),
    context.path.absFromRepoRoot('.github', 'workflows', 'jest.yml'),
    context
  )

  toolbox.interactive.step('Created iOS debug build workflow for Expo.')
}

export const createDebugBuildWorkflowsForExpo = async (
  toolbox: Toolbox,
  context: ProjectContext,
  platforms: Platform[]
): Promise<void> => {
  const androidDir = toolbox.filesystem.exists('android')
  const iosDir = toolbox.filesystem.exists('ios')

  // Using expo prebuild if android and iOS not generated yet
  if (!androidDir && !iosDir) {
    toolbox.print.info('⚙️ Setting up expo prebuild.')
    await toolbox.system.spawn('npx expo prebuild', { stdio: 'inherit' })
    const spinner = toolbox.print.spin('🧹  Cleaning up expo prebuild.')
    await toolbox.system.run('npx expo prebuild --clean')
    spinner.stop()
  }

  if (platforms.includes('android'))
    await createDebugBuildWorkflowAndroid(toolbox, context)

  if (platforms.includes('ios'))
    await createDebugBuildWorkflowIOs(toolbox, context)
}
