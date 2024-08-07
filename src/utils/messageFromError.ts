const messageFromError = (e: unknown): string => {
  if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof e.message === 'string'
  ) {
    return e.message
  }

  // This should normally never be reached, but since you can throw anything
  // and errors have unknown type, we have to handle every case.
  return JSON.stringify(e)
}

export default messageFromError
