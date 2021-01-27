export const limitNumberPrecision = (amount) => {
  const smallPrecisionLimit = Math.pow(10, -amount)
  const bigPrecisionLimit = Math.pow(10, amount)

  const smallestNegativeValue = -smallPrecisionLimit
  const biggestNegativeValue = -bigPrecisionLimit

  const smallestPositiveValue = smallPrecisionLimit
  const biggestPositiveValue = bigPrecisionLimit

  return (num) => {
    if (num < 0) {
      if (num > smallestNegativeValue) {
        return smallestNegativeValue
      }
      if (num < biggestNegativeValue) {
        return biggestNegativeValue
      }
      return num
    }

    if (num < smallestPositiveValue) {
      return smallestPositiveValue
    }
    if (num > biggestPositiveValue) {
      return biggestPositiveValue
    }
    return num
  }
}
