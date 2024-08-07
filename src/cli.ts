import { build } from 'gluegun'
import { Options } from 'gluegun/build/types/domain/options'

async function run(argv: string | Options) {
  const cli = build()
    .brand('react-native-ci-cli')
    .src(__dirname)
    .plugins('./node_modules', {
      matching: 'react-native-ci-cli-*',
      hidden: true,
    })
    .defaultCommand(require('./commands/index'))
    .version()
    .create()

  const toolbox = await cli.run(argv)

  return toolbox
}

module.exports = { run }
