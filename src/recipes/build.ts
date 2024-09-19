import { CycliToolbox, Platform } from '../types'
import { join } from 'path'

const BuildMode = {
  Debug: 'debug',
  Release: 'release',
} as const

type BuildModeType = (typeof BuildMode)[keyof typeof BuildMode]

const createBuildWorkflowForAndroid = async (
  toolbox: CycliToolbox,
  { mode, expo }: { mode: BuildModeType; expo: boolean },
  workflowProps: Record<string, string> = {}
): Promise<string> => {
  const gradleCommands = () => {
    switch (mode) {
      case BuildMode.Debug:
        return 'assembleDebug'
      case BuildMode.Release:
        return 'assembleRelease assembleAndroidTest'
    }
  }

  let script = [
    'cd android &&',
    `./gradlew ${gradleCommands()}`,
    `-DtestBuildType=${mode}`,
    '-Dorg.gradle.jvmargs=-Xmx4g',
  ].join(' ')

  if (expo) {
    script = `npx expo prebuild --${toolbox.context.packageManager()} && ${script}`
  }

  await toolbox.scripts.add(`build:${mode}:android`, script)

  const workflowFileName = await toolbox.workflows.generate(
    join(`build-${mode}`, `build-${mode}-android.ejf`),
    workflowProps
  )

  toolbox.interactive.success(`Created Android ${mode} build workflow.`)

  return workflowFileName
}

const createBuildWorkflowForIOS = async (
  toolbox: CycliToolbox,
  {
    mode,
    iOSAppName,
    expo,
  }: {
    mode: BuildModeType
    iOSAppName: string
    expo: boolean
  },
  workflowProps: Record<string, string> = {}
): Promise<string> => {
  const configuration = () => {
    switch (mode) {
      case BuildMode.Debug:
        return 'Debug'
      case BuildMode.Release:
        return 'Release'
    }
  }

  let script = [
    'xcodebuild ONLY_ACTIVE_ARCH=YES',
    `-workspace ios/${iOSAppName}.xcworkspace`,
    '-UseNewBuildSystem=YES',
    `-scheme ${iOSAppName}`,
    `-configuration ${configuration()}`,
    '-sdk iphonesimulator',
    '-derivedDataPath ios/build',
    '-quiet',
  ].join(' ')

  if (expo) {
    script = `npx expo prebuild --${toolbox.context.packageManager()} && ${script}`
  } else {
    script = `cd ios && pod install && cd .. && ${script}`
  }

  await toolbox.scripts.add(`build:${mode}:ios`, script)

  const workflowFileName = await toolbox.workflows.generate(
    join(`build-${mode}`, `build-${mode}-ios.ejf`),
    {
      iOSAppName,
      ...workflowProps,
    }
  )

  toolbox.interactive.success(`Created iOS ${mode} build workflow.`)

  return workflowFileName
}

export const createBuildWorkflows = async (
  toolbox: CycliToolbox,
  { mode, expo }: { mode: BuildModeType; expo: boolean }
): Promise<{ [key in Platform]: string }> => {
  const existsAndroidDir = toolbox.filesystem.exists('android')
  const existsIOsDir = toolbox.filesystem.exists('ios')

  if (expo) {
    await toolbox.expo.prebuild({ cleanAfter: false })
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

  let lookupDebugBuildWorkflowFileName = ''

  if (mode === BuildMode.Debug) {
    lookupDebugBuildWorkflowFileName = await toolbox.workflows.generate(
      join('build-debug', 'lookup-cached-debug-build.ejf')
    )

    await toolbox.scripts.add(
      'fingerprint:android',
      "npx expo-updates fingerprint:generate --platform android | jq -r '.hash' | xargs -n 1 echo 'fingerprint:'"
    )

    await toolbox.scripts.add(
      'fingerprint:ios',
      "npx expo-updates fingerprint:generate --platform ios | jq -r '.hash' | xargs -n 1 echo 'fingerprint:'"
    )
  }

  const androidBuildWorkflowFileName = await createBuildWorkflowForAndroid(
    toolbox,
    { mode, expo },
    { lookupDebugBuildWorkflowFileName }
  )

  const iOSBuildWorkflowFileName = await createBuildWorkflowForIOS(
    toolbox,
    {
      mode,
      iOSAppName,
      expo,
    },
    { lookupDebugBuildWorkflowFileName }
  )

  if (!existsAndroidDir) toolbox.filesystem.remove('android')
  if (!existsIOsDir) toolbox.filesystem.remove('ios')

  return {
    android: androidBuildWorkflowFileName,
    ios: iOSBuildWorkflowFileName,
  }
}
