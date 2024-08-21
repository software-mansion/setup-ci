import { CycliToolbox, ProjectContext } from '../types'
import { createHash } from 'crypto'
import { createReadStream } from 'fs'
import { join, sep } from 'path'
import { expandDirectory } from '../utils/expandDirectory'

const prettyTree = require('pretty-file-tree')

module.exports = (toolbox: CycliToolbox) => {
  const generateFileChecksum = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256')
      const stream = createReadStream(path)

      stream.on('data', (data) => {
        hash.update(data)
      })

      stream.on('end', () => {
        resolve(hash.digest('hex'))
      })

      stream.on('error', (err) => {
        reject(err)
      })
    })
  }

  const statusFromGitOutput = (statusFromGit: string): Status => {
    switch (statusFromGit) {
      case 'D':
        return 'deleted'
      case 'M':
        return 'modified'
      default:
        return 'added'
    }
  }

  const gitStatus = async (context: ProjectContext): Promise<Snapshot> => {
    const pathsList: [Status, string][] = await toolbox.system
      .exec('git status --porcelain', {
        cwd: context.path.absFromRepoRoot(),
      })
      .then((output) =>
        output
          .split('\n')
          .map((line: string) => line.trim().split(' ').filter(Boolean))
          .filter((line: string[]) => line.length >= 2)
          .map((line: string[]) => [statusFromGitOutput(line[0]), line[1]])
      )

    let expandedPathsList: [Status, string][] = []

    for (const [status, path] of pathsList) {
      const expandedPaths = await expandDirectory(
        context.path.absFromRepoRoot(path)
      )
      expandedPathsList = expandedPathsList.concat(
        expandedPaths.map((expandedPath) => [status, expandedPath])
      )
    }

    return await Promise.all(
      expandedPathsList.map(async ([status, path]: [Status, string]) => ({
        path,
        checksum: await generateFileChecksum(path),
        status,
      }))
    ).then(
      (files) =>
        new Map(
          files.map(({ path, checksum, status }) => [
            path,
            { checksum, status },
          ])
        )
    )
  }

  const compare = (before: Snapshot, after: Snapshot): Diff => {
    return Array.from(
      new Set([...Array.from(before.keys()), ...Array.from(after.keys())])
    ).reduce((diff, path) => {
      const checksumBefore = before.get(path)?.checksum
      const checksumAfter = after.get(path)?.checksum
      const status = after.get(path)?.status || 'deleted'

      if (checksumBefore !== checksumAfter) {
        diff.set(path, { checksumBefore, checksumAfter, status })
      }

      return diff
    }, new Map())
  }

  const colorizeDiffPath = (path: string, status: Status): string => {
    const { cyan, green, yellow } = toolbox.print.colors

    const splitPath = path.split(sep)

    const [prefix, fileName] = [
      splitPath.slice(0, splitPath.length - 1),
      splitPath[splitPath.length - 1],
    ]

    return [
      ...prefix.map((segment) => cyan(segment)),
      status === 'added' ? green(`${fileName} (+)`) : yellow(`${fileName} (~)`),
    ].join(sep)
  }

  const print = (diff: Diff, context: ProjectContext): void => {
    toolbox.interactive.vspace()

    if (diff.size === 0) {
      toolbox.interactive.info('No files have been added or modified.', 'cyan')
      return
    }

    toolbox.interactive.info(
      'The following files have been added or modified:',
      'cyan'
    )
    toolbox.interactive.vspace()
    toolbox.interactive.info(
      prettyTree(
        Array.from(diff.entries()).map(([path, { status }]) =>
          colorizeDiffPath(
            join(
              context.path.repoFolderName,
              path.substring(context.path.absFromRepoRoot().length + 1)
            ),
            status
          )
        )
      )
        .split('|')
        .join('│')
    )
  }

  toolbox.diff = { gitStatus, compare, print }
}

type Status = 'added' | 'modified' | 'deleted'

type Snapshot = Map<string, { checksum: string; status: Status }>

type Diff = Map<
  string,
  {
    checksumBefore?: string
    checksumAfter?: string
    status: Status
  }
>

export interface DiffExtension {
  diff: {
    gitStatus: (context: ProjectContext) => Promise<Snapshot>
    compare: (before: Snapshot, after: Snapshot) => Diff
    print: (diff: Diff, context: ProjectContext) => void
  }
}
