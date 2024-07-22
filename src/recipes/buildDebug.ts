import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { confirm } from '@clack/prompts'

const COMMAND = 'build-debug'

export const executeExpoWorkflow = async (
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
    `npx expo prebuild && xcodebuild -workspace ios/${iOSAppName}.xcworkspace -scheme ${iOSAppName} -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`
  )

  await toolbox.scripts.add(
    'build:debug:android',
    'npx expo prebuild && cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
  )

  await toolbox.template.generate({
    template: 'buildDebug/build-debug-android.ejf',
    target: `.github/workflows/build-debug-android.yml`,
  })

  await toolbox.template.generate({
    template: 'buildDebug/build-debug-ios.ejf',
    target: `.github/workflows/build-debug-ios.yml`,
    props: {
      iOSAppName,
    },
  })

  toolbox.print.info('✔ Created build debug workflow for Expo.')
}

const execute = () => async (toolbox: Toolbox) => {
  const expoConfigJSON = toolbox.filesystem.read('app.json', 'json')

  if (expoConfigJSON) {
    await executeExpoWorkflow(toolbox, expoConfigJSON)
  } else {
    // TODO: Handle EAS Update etc.
  }

  return `--${COMMAND}`
}

const run = async (
  toolbox: Toolbox
): Promise<(toolbox: Toolbox) => Promise<string> | null> => {
  if (toolbox.skipInteractiveForCommand(COMMAND)) {
    return execute()
  }

  if (toolbox.skipInteractive()) {
    return null
  }

  const proceed = await confirm({
    message: 'Do you want to run debug build on every PR?',
  })

  if (!proceed) {
    return
  }

  return execute()
}

export default run
