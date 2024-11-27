import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { createBuildWorkflows } from './build'
import { join } from 'path'

const DETOX_BARE_PROJECT_CONFIG_URL = `https://wix.github.io/Detox/docs/next/introduction/project-setup/#step-4-additional-android-configuration`
const DETOX_EXPO_PLUGIN = '@config-plugins/detox'
const FLAG = 'detox'

const addDetoxExpoPlugin = async (toolbox: CycliToolbox) => {
  const currentExpoPlugins =
    toolbox.projectConfig.appJson()?.expo?.plugins || []

  const isDetoxExpoPluginAdded =
    currentExpoPlugins.includes(DETOX_EXPO_PLUGIN) ||
    toolbox.projectConfig.appJs()?.includes(DETOX_EXPO_PLUGIN)

  if (!isDetoxExpoPluginAdded) {
    const patch = {
      expo: {
        plugins: [...currentExpoPlugins, DETOX_EXPO_PLUGIN],
      },
    }

    await toolbox.projectConfig.patchAppConfig(patch)
  }
}

const execute = async (toolbox: CycliToolbox, context: ProjectContext) => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating Detox workflow')

  const expo = toolbox.projectConfig.isExpo()

  if (!expo) {
    await toolbox.interactive.actionPrompt(
      [
        'You have chosen to setup Detox for a non-expo project.',
        'To make the setup work properly, you need to manually patch native code for Detox.',
        'Please follow the instructions in Step 4 of',
        `${DETOX_BARE_PROJECT_CONFIG_URL}.`,
        'You can do it now or after the script finishes.\n',
      ].join('\n')
    )
    toolbox.furtherActions.push(
      `Follow Step 4 of ${DETOX_BARE_PROJECT_CONFIG_URL} to patch native code for Detox.`
    )
  }

  await createBuildWorkflows(toolbox, context, {
    mode: 'release',
    expo,
  })

  await toolbox.dependencies.addDev('detox', context)
  // >=29 because of https://wix.github.io/Detox/docs/introduction/project-setup#step-1-bootstrap
  await toolbox.dependencies.addDev('jest', context, {
    version: '">=29"',
    skipInstalledCheck: true,
  })
  await toolbox.dependencies.addDev('typescript', context)
  await toolbox.dependencies.addDev('ts-jest', context)
  await toolbox.dependencies.addDev('@types/jest', context)

  if (expo) {
    await toolbox.dependencies.addDev(DETOX_EXPO_PLUGIN, context)
    await addDetoxExpoPlugin(toolbox)
  }

  await toolbox.scripts.add(
    'detox:test:android',
    'detox test --config-path .detoxrc-ci.js --configuration android.emu.release --cleanup'
  )

  await toolbox.scripts.add(
    'detox:test:ios',
    'detox test --config-path .detoxrc-ci.js --configuration ios.sim.release --cleanup'
  )

  await toolbox.template.generate({
    template: join('detox', '.detoxrc-ci.js.ejs'),
    target: `.detoxrc-ci.js`,
  })

  toolbox.interactive.step('Created .detoxrc-ci.js configuration file.')

  if (!toolbox.filesystem.exists('e2e')) {
    await toolbox.template.generate({
      template: join('detox', 'jest.config.js.ejs'),
      target: join('e2e', 'jest.config.js'),
    })

    await toolbox.template.generate({
      template: join('detox', 'starter.test.ts.ejs'),
      target: join('e2e', 'starter.test.ts'),
    })

    toolbox.interactive.step(
      'Initialized e2e/ directory with default detox jest configuration.'
    )

    const jestConfigMessage =
      'Consider adding "modulePathIgnorePatterns": ["e2e"] to your jest config.'
    toolbox.interactive.warning(jestConfigMessage)
    toolbox.furtherActions.push(jestConfigMessage)

    const starterTestMessage =
      'Remember to edit example test in e2e/starter.test.ts to match your app.'
    toolbox.interactive.warning(starterTestMessage)
    toolbox.furtherActions.push(starterTestMessage)
  }

  await toolbox.workflows.generate(
    join('detox', 'test-detox-android.ejf'),
    context
  )

  await toolbox.workflows.generate(join('detox', 'test-detox-ios.ejf'), context)

  toolbox.interactive.success('Created Detox workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Detox',
    flag: FLAG,
    description: 'Generate workflow to run Detox e2e tests on every PR',
    selectHint: 'run detox e2e tests suite',
  },
  execute,
} as const

export default recipe
