import { substractVector, normalizeVector } from "./vector.js"

export const createRectangle = ({ center, width, height }) => {
  return {
    center,
    width,
    height,
  }
}

export const rectangleToVertex = ({ center, width, height }) => {
  return {
    topLeftVertex: { x: center.x - width / 2, y: center.y - height / 2 },
    topRightVertex: { x: center.x + width / 2, y: center.y - height / 2 },
    bottomRightVertex: { x: center.x + width / 2, y: center.y + height / 2 },
    bottomLeftVertex: { x: center.x - width / 2, y: center.y + height / 2 },
  }
}

export const rectangleToFaceNormals = ({ center, width, height }) => {
  const { topLeftVertex, topRightVertex, bottomRightVertex, bottomLeftVertex } = rectangleToVertex({
    center,
    width,
    height,
  })

  return {
    top: normalizeVector(substractVector(topRightVertex, bottomRightVertex)),
    right: normalizeVector(substractVector(bottomRightVertex, bottomLeftVertex)),
    bottom: normalizeVector(substractVector(bottomLeftVertex, topLeftVertex)),
    left: normalizeVector(substractVector(topLeftVertex, topRightVertex)),
  }
}

export const drawRectangle = ({ center, width, height, angle }, context) => {
  const { topLeftVertex } = rectangleToVertex({ center, width, height })

  context.save()
  context.translate(topLeftVertex.x, topLeftVertex.y)
  context.rotate(angle)
  context.strokeRect(0, 0, width, height)
  context.restore()
}
