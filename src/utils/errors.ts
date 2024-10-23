import { CYCLI_ERROR_NAME } from '../constants'

export const isError = (e: unknown): boolean => {
  return Boolean(
    typeof e === 'object' &&
      e != null &&
      'message' in e &&
      typeof e.message === 'string' &&
      'name' in e &&
      typeof e.name === 'string'
  )
}

export const isCycliError = (e: unknown): boolean => {
  return isError(e) && (e as Error).name === CYCLI_ERROR_NAME
}

export const messageFromError = (e: unknown): string => {
  if (isError(e)) {
    return (e as Error).message
  }

  // This should normally never be reached, but since you can throw anything
  // and errors have unknown type, we have to handle every case.
  return JSON.stringify(e)
}
