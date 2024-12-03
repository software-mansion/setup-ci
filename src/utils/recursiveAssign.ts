import assignWith from 'lodash/assignWith'

type Value =
  | string
  | string[]
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>

export const recursiveAssign = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> => {
  const customizer = (targetValue: Value, sourceValue: Value) => {
    if (typeof sourceValue !== 'object' || typeof targetValue !== 'object') {
      return sourceValue
    }
    return recursiveAssign(
      targetValue as Record<string, unknown>,
      sourceValue as Record<string, unknown>
    )
  }

  return assignWith(target, source, customizer)
}
