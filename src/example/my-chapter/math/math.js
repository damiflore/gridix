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

export const sameSign = (a, b) => {
  if (a < 0) {
    return b < 0
  }
  return b > 0
}
