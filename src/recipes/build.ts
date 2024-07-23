import { Toolbox } from 'gluegun/build/types/domain/toolbox'

export const createBuildWorkflows = async (
  toolbox: Toolbox,
  expoConfigJSON: Record<string, any>
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

  const iOSAppName = expoConfigJSON?.expo?.name.replaceAll('-', '')

  await toolbox.scripts.add(
    'build:debug:ios',
    [
      'npx expo prebuild &&',
      `xcodebuild -workspace ios/${iOSAppName}.xcworkspace`,
      `-scheme ${iOSAppName}`,
      '-configuration Debug',
      '-sdk iphonesimulator',
      '-derivedDataPath ios/build',
    ].join(' ')
  )

  await toolbox.scripts.add(
    'build:release:ios',
    [
      'npx expo prebuild &&',
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

  await toolbox.scripts.add(
    'build:debug:android',
    'npx expo prebuild && cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
  )

  await toolbox.template.generate({
    template: 'build-debug/build-debug-android.ejf',
    target: `.github/workflows/build-debug-android.yml`,
  })

  await toolbox.template.generate({
    template: 'build-release/build-release-ios.ejf',
    target: `.github/workflows/build-release-ios.yml`,
    props: {
      iOSAppName,
    },
  })

  toolbox.print.info('✔ Created build workflow for Expo.')
}
