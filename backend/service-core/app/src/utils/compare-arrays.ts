export function isSame<T>(a: T[], b: T[], comparator?: (a: T, b: T) => boolean) {
  if (a.length != b.length) return false

  a.sort()
  b.sort()

  if (typeof comparator === 'function') {
    for (let i = 0; i < a.length; i++)
      if (!comparator(a[i], b[i]))
        return false
  }
  else {
    for (let i = 0; i < a.length; i++)
      if (a[i] !== b[i])
        return false
  }


  return true
}