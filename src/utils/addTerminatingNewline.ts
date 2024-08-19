import { filesystem } from 'gluegun'

export const addTerminatingNewline = (path: string): void => {
  const content = filesystem.read(path)

  if (!content || content[content.length - 1] !== '\n') {
    filesystem.append(path, '\n')
  }
}
