export const clampMagnitude = (number, max) => {
  if (number < 0) {
    if (number < -max) {
      return -max
    }

    return number
  }

  if (number > max) {
    return max
  }

  return number
}

export const clamp = (number, min, max = Infinity) => {
  if (number < min) {
    return min
  }

  if (number > max) {
    return max
  }

  return number
}

export const sameSign = (a, b) => {
  if (a < 0) {
    return b < 0
  }
  return b > 0
}

export const maxFloatPrecision = (value, precision = 2) => {
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}
