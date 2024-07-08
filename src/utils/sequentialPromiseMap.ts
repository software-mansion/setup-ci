const sequentialPromiseMap = async <T, S>(
  input: T[],
  mapper: (arg: T) => Promise<S>
): Promise<S[]> => {
  const results = []
  for (const next of input) {
    const nextResult = await mapper(next)
    results.push(nextResult)
  }
  return results
}

export default sequentialPromiseMap
