import { rotateVector, normalizeVector, substractVector } from "./vector.js"

export const rectangleToTopLeftCorner = ({ centerX, centerY, width, height, angle }) => {
  return rotateVector(
    { x: centerX - width / 2, y: centerY - height / 2 },
    { centerX, centerY, angle },
  )
}

export const rectangleToCorners = ({ centerX, centerY, width, height, angle }) => {
  return {
    topLeftCorner: rectangleToTopLeftCorner({ centerX, centerY, width, height, angle }),
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
export const RECTANGLE_CORNER_KEYS = [
  "topLeftCorner",
  "topRightCorner",
  "bottomRightCorner",
  "bottomLeftCorner",
]

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
export const RECTANGLE_NORMAL_KEYS = ["topNormal", "rightNormal", "bottomNormal", "leftNormal"]
