import { CycliToolbox, Platform, WorkflowEvent } from '../types'
import { join } from 'path'

const BuildMode = {
  Debug: 'debug',
  Release: 'release',
} as const

type BuildModeType = (typeof BuildMode)[keyof typeof BuildMode]

const configureProjectForAndroidBuild = async (
  toolbox: CycliToolbox,
  { mode }: { mode: BuildModeType }
): Promise<void> => {
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

  if (toolbox.projectConfig.isExpo()) {
    script = `npx expo prebuild --${toolbox.context.packageManager()} && ${script}`
  }

  await toolbox.scripts.add(`build:${mode}:android`, script)

  toolbox.interactive.success(`Configured project for Android ${mode} build.`)
}

const generateBuildWorkflowForAndroid = async (
  toolbox: CycliToolbox,
  { mode, events }: { mode: BuildModeType; events: WorkflowEvent[] },
  workflowProps: Record<string, string> = {}
): Promise<string> => {
  const workflowFileName = await toolbox.workflows.generate(
    join(`build-${mode}`, `build-${mode}-android.ejf`),
    { events },
    workflowProps
  )

  toolbox.interactive.success(`Created Android ${mode} build workflow.`)

  return workflowFileName
}

const configureProjectForIOSBuild = async (
  toolbox: CycliToolbox,
  { mode }: { mode: BuildModeType }
): Promise<void> => {
  const iOSAppName = await toolbox.projectConfig.getIOSAppName()

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

  if (toolbox.projectConfig.isExpo()) {
    script = `npx expo prebuild --${toolbox.context.packageManager()} && ${script}`
  } else {
    script = `cd ios && pod install && cd .. && ${script}`
  }

  await toolbox.scripts.add(`build:${mode}:ios`, script)

  toolbox.interactive.success(`Configured project for iOS ${mode} build.`)
}

const generateBuildWorkflowForIOS = async (
  toolbox: CycliToolbox,
  { mode, events }: { mode: BuildModeType; events: WorkflowEvent[] },
  workflowProps: Record<string, string> = {}
): Promise<string> => {
  const iOSAppName = await toolbox.projectConfig.getIOSAppName()

  const workflowFileName = await toolbox.workflows.generate(
    join(`build-${mode}`, `build-${mode}-ios.ejf`),
    { events },
    {
      iOSAppName,
      ...workflowProps,
    }
  )

  toolbox.interactive.success(`Created iOS ${mode} build workflow.`)

  return workflowFileName
}

export const configureProjectForBuild = async (
  toolbox: CycliToolbox,
  { mode }: { mode: BuildModeType }
): Promise<void> => {
  if (toolbox.projectConfig.isExpo()) {
    await toolbox.projectConfig.checkAppNameInConfigOrGenerate()
  }

  await configureProjectForAndroidBuild(toolbox, { mode })
  await configureProjectForIOSBuild(toolbox, { mode })

  if (mode === BuildMode.Debug) {
    await toolbox.scripts.add(
      'fingerprint:android',
      "npx expo-updates fingerprint:generate --platform android | jq -r '.hash' | xargs -n 1 echo 'fingerprint:'"
    )

    await toolbox.scripts.add(
      'fingerprint:ios',
      "npx expo-updates fingerprint:generate --platform ios | jq -r '.hash' | xargs -n 1 echo 'fingerprint:'"
    )
  }
}

export const generateBuildWorkflows = async (
  toolbox: CycliToolbox,
  { mode, events }: { mode: BuildModeType; events: WorkflowEvent[] }
): Promise<{ [key in Platform]: string }> => {
  let lookupDebugBuildWorkflowFileName = ''

  if (mode === BuildMode.Debug) {
    lookupDebugBuildWorkflowFileName = await toolbox.workflows.generate(
      join('build-debug', 'lookup-cached-debug-build.ejf'),
      { events: [] }
    )
  }

  const androidBuildWorkflowFileName = await generateBuildWorkflowForAndroid(
    toolbox,
    { mode, events },
    { lookupDebugBuildWorkflowFileName }
  )

  const iOSBuildWorkflowFileName = await generateBuildWorkflowForIOS(
    toolbox,
    { mode, events },
    { lookupDebugBuildWorkflowFileName }
  )

  return {
    android: androidBuildWorkflowFileName,
    ios: iOSBuildWorkflowFileName,
  }
}
