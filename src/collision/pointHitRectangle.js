import { rotateVector } from "../geometry/vector.js"

export const pointHitRectangle = (point, rectangle) => {
  if (rectangle.angle) {
    return pointHitRotatedRectangle(point, rectangle)
  }

  return pointHitRectangleWithoutRotation(point, rectangle)
}

const pointHitRectangleWithoutRotation = (point, rectangleWihoutRotation) => {
  const pointX = point.x
  const pointY = point.y
  const { centerX, centerY, width, height } = rectangleWihoutRotation

  const left = centerX - width / 2
  if (pointX < left) {
    return false
  }

  const right = left + width
  if (pointX > right) {
    return false
  }

  const top = centerY - height / 2
  if (pointY < top) {
    return false
  }

  const bottom = top + height
  if (pointY > bottom) {
    return false
  }

  return true
}

const pointHitRotatedRectangle = (point, rectangleWithRotation) => {
  const rectangleCenterX = rectangleWithRotation.centerX
  const rectangleCenterY = rectangleWithRotation.centerY
  const rectangleAngle = rectangleWithRotation.angle
  const pointUnrotated = rotateVector(point, {
    centerX: rectangleCenterX,
    centerY: rectangleCenterY,
    angle: -rectangleAngle,
  })

  return pointHitRectangleWithoutRotation(pointUnrotated, rectangleWithRotation)
}
