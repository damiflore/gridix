import { GameObject } from "./gameObject.js"
import { substractVector, normalizeVector, rotateVector } from "./vector.js"

export const createRectangle = ({ centerX, centerY, width, height, ...props }) => {
  return {
    ...GameObject,
    name: "rectangle",
    centerX,
    centerY,
    width,
    height,
    ...props,
  }
}

export const rectangleToCorners = ({ centerX, centerY, width, height, angle }) => {
  return {
    topLeftCorner: rotateVector(
      { x: centerX - width / 2, y: centerY - height / 2 },
      { centerX, centerY, angle },
    ),
    topRightCorner: rotateVector(
      { x: centerX + width / 2, y: centerY - height / 2 },
      { centerX, centerY, angle },
    ),
    bottomRightCorner: rotateVector(
      { x: centerX + width / 2, y: centerY + height / 2 },
      { centerX, centerY, angle },
    ),
    bottomLeftCorner: rotateVector(
      { x: centerX - width / 2, y: centerY + height / 2 },
      { centerX, centerY, angle },
    ),
  }
}

export const drawRectangle = ({ centerX, centerY, width, height, angle }, context) => {
  const { topLeftCorner } = rectangleToCorners({
    centerX,
    centerY,
    width,
    height,
    angle,
  })
  context.save()
  context.translate(topLeftCorner.x, topLeftCorner.y)
  context.rotate(angle)
  context.strokeRect(0, 0, width, height)
  context.restore()
}

export const rectangleToNormals = ({ centerX, centerY, width, height, angle }) => {
  const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = rectangleToCorners(
    {
      centerX,
      centerY,
      width,
      height,
      angle,
    },
  )

  return {
    topNormal: normalizeVector(substractVector(topRightCorner, bottomRightCorner)),
    rightNormal: normalizeVector(substractVector(bottomRightCorner, bottomLeftCorner)),
    bottomNormal: normalizeVector(substractVector(bottomLeftCorner, topLeftCorner)),
    leftNormal: normalizeVector(substractVector(topLeftCorner, topRightCorner)),
  }
}
