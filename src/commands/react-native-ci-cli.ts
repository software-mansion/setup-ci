import { GluegunCommand, GluegunToolbox } from 'gluegun'
import { SKIP_INTERACTIVE_FLAG } from '../constants'
import lint from '../recipes/lint'
import jest from '../recipes/jest'
import typescriptCheck from '../recipes/typescript'
import prettierCheck from '../recipes/prettier'
import easUpdate from '../recipes/eas-update'
import isGitDirty from 'is-git-dirty'
import sequentialPromiseMap from '../utils/sequentialPromiseMap'
import { Option, ProjectContext } from '../types'

const SKIP_GIT_CHECK_FLAG = 'skip-git-check'
const COMMAND = 'react-native-ci-cli'

const runReactNativeCiCli = async (toolbox: GluegunToolbox) => {
  toolbox.interactive.intro('Welcome to React Native CI CLI')

  if (isGitDirty() == null) {
    throw Error('This is not a git repository.')
  }

  if (isGitDirty() && !toolbox.parameters.options[SKIP_GIT_CHECK_FLAG]) {
    if (toolbox.skipInteractive()) {
      throw Error(
        `You have to commit your changes before running in silent mode or use --${SKIP_GIT_CHECK_FLAG}.`
      )
    }

    const proceed = await toolbox.interactive.confirm(
      'You have uncommitted changes. Do you want to proceed?'
    )

    if (!proceed) {
      toolbox.interactive.outro(
        'Please commit your changes before running this command.'
      )
      return
    }
  }

  const context: ProjectContext = toolbox.projectContext.obtain()

  const lintExecutor = await lint.run(toolbox, context)
  const jestExecutor = await jest.run(toolbox, context)
  const typescriptExecutor = await typescriptCheck.run(toolbox, context)
  const prettierExecutor = await prettierCheck.run(toolbox, context)
  const easUpdateExecutor = await easUpdate.run(toolbox, context)

  const executors = [
    lintExecutor,
    jestExecutor,
    typescriptExecutor,
    prettierExecutor,
    easUpdateExecutor,
  ].filter((executor) => executor != null)

  if (executors.length === 0) {
    toolbox.interactive.outro('Nothing to do here. Cheers! 🎉')
    return
  }

  toolbox.interactive.outro("Let's roll")

  toolbox.interactive.step(
    `Detected ${context.packageManager} as your package manager.`
  )

  const executorResults = await sequentialPromiseMap(executors, (executor) =>
    executor(toolbox, context)
  )

  const usedFlags = executorResults.join(' ')

  toolbox.interactive.success(`We're all set 🎉.`)

  if (!toolbox.skipInteractive()) {
    toolbox.interactive.success(
      `Next time you can run the command in silent mode using npx ${COMMAND} --${SKIP_INTERACTIVE_FLAG} ${usedFlags}.`
    )
  }
}

const getFeatureOptions = (): Option[] => {
  return [
    lint.option,
    jest.option,
    typescriptCheck.option,
    prettierCheck.option,
    easUpdate.option,
  ]
}

const command: CycliCommand = {
  name: COMMAND,
  description: 'Quickly setup CI workflows for your React Native app',
  options: [
    { flag: 'help', description: 'Print help message' },
    { flag: 'version', description: 'Print version' },
    {
      flag: 'skip-git-check',
      description: 'Skip check for dirty git repository',
    },
    {
      flag: 'silent',
      description:
        'Run in silent mode. Combine with feature flags to specify generated workflows',
    },
  ],
  featureOptions: [...getFeatureOptions()],
  run: async (toolbox: GluegunToolbox) => {
    try {
      await runReactNativeCiCli(toolbox)
    } catch (error) {
      toolbox.interactive.error(
        `Failed to execute react-native-ci-cli with following error:\n${error.message}`
      )
    } finally {
      process.exit()
    }
  },
}

module.exports = command

export type CycliCommand = GluegunCommand & {
  options: Option[]
  featureOptions: Option[]
}
