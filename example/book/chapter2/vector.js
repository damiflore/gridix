// TODO: disable this in jsenv eslint config
/* eslint-disable operator-assignment */
export const getVectorLength = ({ x, y }) => {
  return Math.sqrt(x * x + y * y)
}

export const addVector = (vectorA, vectorB) => {
  return {
    x: vectorA.x + vectorB.x,
    y: vectorA.y + vectorB.y,
  }
}

export const substractVector = (vectorA, vectorB) => {
  return {
    x: vectorA.x - vectorB.x,
    y: vectorA.y - vectorB.y,
  }
}

export const scaleVector = (vector, scale) => {
  return {
    x: vector.x * scale,
    y: vector.y * scale,
  }
}

export const getScalarProduct = (vectorA, vectorB) => {
  return vectorA.x * vectorB.x + vectorA.y * vectorB.y
}

export const getVectorialProduct = (vectorA, vectorB) => {
  return vectorA.x * vectorB.y - vectorA.y * vectorB.x
}

export const rotateVector = (vector, { centerX, centerY, angle }) => {
  // rotate in counterclockwise
  const xDiff = vector.x - centerX
  const yDiff = vector.y - centerY
  const x = xDiff * Math.cos(angle) - yDiff * Math.sin(angle)
  const y = xDiff * Math.sin(angle) + yDiff * Math.cos(angle)

  return {
    x: x + centerX,
    y: y + centerY,
  }
}

export const normalizeVector = (vector) => {
  const length = getVectorLength(vector)

  if (length > 0) {
    const lengthInverted = 1 / length
    return {
      x: vector.x * lengthInverted,
      y: vector.y * lengthInverted,
    }
  }

  return {
    x: vector.x * length,
    y: vector.y * length,
  }
}

export const getDistanceBetweenVectors = (vectorA, vectorB) => {
  const xDiff = vectorA.x - vectorB.x
  const yDiff = vectorA.y - vectorB.y
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}
