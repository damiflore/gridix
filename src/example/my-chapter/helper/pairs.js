export const forEachPairs = (array, callback) => {
  let i = 0
  while (i < array.length) {
    const value = array[i]
    i++
    let j = i
    while (j < array.length) {
      const otherValue = array[j]
      j++
      callback(value, otherValue)
    }
  }
}
