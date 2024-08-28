import { execSync } from 'child_process'
import { PATH_TO_TEST_PROJECTS } from './utils'

module.exports = async () => {
  execSync(`rm -rf ${PATH_TO_TEST_PROJECTS}`)
}
