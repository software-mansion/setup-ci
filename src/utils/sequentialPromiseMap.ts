const sequentialPromiseMap = async <T, S>(
  input: T[],
  mapper: (arg: T) => Promise<S> | null
): Promise<S[]> => {
  const results: S[] = []
  for (const next of input) {
    const nextResult = await mapper(next)
    if (nextResult) results.push(nextResult)
  }
  return results
}

export default sequentialPromiseMap
