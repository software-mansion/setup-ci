import { CycliRecipe, CycliToolbox, ProjectContext } from '../types'
import { join } from 'path'

export const FLAG = 'biome'

const BIOME_CONFIGURATION_FILES = ['biome.json', 'biome.jsonc']

const existsBiomeConfiguration = (toolbox: CycliToolbox): boolean =>
  Boolean(
    toolbox.filesystem
      .list()
      ?.some((f) => BIOME_CONFIGURATION_FILES.includes(f))
  )

const execute = async (
  toolbox: CycliToolbox,
  context: ProjectContext
): Promise<void> => {
  toolbox.interactive.vspace()
  toolbox.interactive.sectionHeader('Generating Biome check workflow')

  await toolbox.dependencies.addDev('@biomejs/biome', context)

  await toolbox.scripts.add('biome:check', 'biome check')
  await toolbox.scripts.add('biome:write', 'biome check --write')
  await toolbox.scripts.add('biome:ci', 'biome ci')

  await toolbox.workflows.generate(join('biome', 'biome.ejf'), context)

  if (!existsBiomeConfiguration(toolbox)) {
    await toolbox.template.generate({
      template: join('biome', 'biome-config.ejf'),
      target: 'biome.json',
    })

    toolbox.interactive.step('Created default biome.json configuration file.')
  }

  toolbox.interactive.success('Created Biome check workflow.')
}

export const recipe: CycliRecipe = {
  meta: {
    name: 'Biome',
    flag: FLAG,
    description: 'Generate Biome check workflow to run on every PR',
    selectHint: 'complex code quality check with Biome',
  },
  execute,
}

export default recipe
