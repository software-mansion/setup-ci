import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { Platform, ProjectContext } from '../types'
import { join } from 'path'

const createReleaseBuildWorkflowAndroid = async (toolbox: Toolbox) => {
  // NOTE: Currently not needed.
  toolbox.interactive.step('Created Android release build workflow for Expo.')
}

const createReleaseBuildWorkflowIOs = async (
  toolbox: Toolbox,
  context: ProjectContext
) => {
  await toolbox.scripts.add(
    'build:release:ios',
    [
      'npx expo prebuild &&',
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
    context.path.absFromRepoRoot('.github', 'workflows', 'jest.yml'),
    context
  )

  toolbox.interactive.step('Created iOS release build workflow for Expo.')
}

export const createReleaseBuildWorkflowsForExpo = async (
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
    await createReleaseBuildWorkflowAndroid(toolbox)

  if (platforms.includes('ios'))
    await createReleaseBuildWorkflowIOs(toolbox, context)
}
