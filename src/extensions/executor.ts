import { RECIPES } from '../constants'
import { CycliToolbox } from '../types'

module.exports = (toolbox: CycliToolbox) => {
  const configureProject = async () => {
    const selectedRecipes = Array.from(
      await toolbox.config.getSelectedRecipes()
    )

    for (const recipeType of selectedRecipes) {
      await RECIPES[recipeType].configureProject(toolbox)
    }
  }

  const generateWorkflows = async () => {
    toolbox.interactive.vspace()
    toolbox.interactive.sectionHeader('Generating workflows')

    const selectedRecipes = Array.from(
      await toolbox.config.getSelectedRecipes()
    )
    const config = await toolbox.config.get()

    for (const recipeType of selectedRecipes) {
      await RECIPES[recipeType].generateWorkflow(
        toolbox,
        Array.from(config)
          .filter(([, recipes]) => recipes.has(recipeType))
          .map(([event]) => event)
      )
    }
  }

  toolbox.executor = {
    configureProject,
    generateWorkflows,
  }
}

export interface ExecutorExtension {
  executor: {
    configureProject: () => Promise<void>
    generateWorkflows: () => Promise<void>
  }
}
