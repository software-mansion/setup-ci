const fs = require('fs')
const semver = require('semver')

const packageJSON = require('../package.json')

const currentVersion = packageJSON.version

const timestamp = Math.floor(Date.now() / 1000)
const newVersion = `${semver.inc(currentVersion, 'patch')}-dev.${timestamp}`

packageJSON.version = newVersion
fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2))

console.log(`Updated version to ${newVersion}`)
