const supportsHyperlinks = require('supports-hyperlinks')
const hyperlinker = require('hyperlinker')

export const terminalHyperlink = (text: string, url: string): string => {
  if (supportsHyperlinks.stdout) {
    return hyperlinker(text, url)
  }
  return url
}
