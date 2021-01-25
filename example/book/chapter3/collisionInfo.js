import { scaleVector } from "../chapter2/vector.js"
import { substractVector, getVectorLength, normalizeVector } from "./vector.js"

export const getGameObjectCollisionInfo = (shape, otherShape) => {
  if (shape.type === "circle" && otherShape.type === "circle") {
    return getCollisionInfoForCircleToCircle(shape, otherShape)
  }
  return null
}

export const getOppositeCollisionInfo = ({
  depth,
  normalX,
  normalY,
  startX,
  startY,
  endX,
  endY,
}) => {
  return {
    depth,
    normalX: normalX * -1,
    normalY: normalY * -1,
    startX: endX,
    startY: endY,
    endX: startX,
    endY: startY,
  }
}

const getCollisionInfoForCircleToCircle = (circleA, circleB) => {
  const centerDiff = substractVector(
    { x: circleA.centerX, y: circleA.centerY },
    { x: circleB.centerX, y: circleB.centerY },
  )
  const centerDistance = getVectorLength(centerDiff)
  const radiusSum = circleA.radius + circleB.radius

  if (centerDistance > radiusSum) {
    return false
  }

  // center at the same position
  if (centerDistance === 0) {
    if (circleA.radius > circleB.radius) {
      return createCollisionInfo({
        depth: radiusSum,
        normalX: 0,
        normalY: -1,
        startX: circleB.centerX,
        startY: circleB.centerY + circleB.radius,
      })
    }
    return createCollisionInfo({
      depth: radiusSum,
      normalX: 0,
      normalY: -1,
      startX: circleA.centerX,
      startY: circleA.centerY + circleA.radius,
    })
  }

  // overlapping and center at different position
  const centerDiffNormalized = normalizeVector(centerDiff)
  const centerDiffInvertedAndNormalized = normalizeVector(scaleVector(centerDiff, -1))
  const centerDiffRadius = scaleVector(centerDiffInvertedAndNormalized, circleB.radius)

  return createCollisionInfo({
    depth: radiusSum - centerDistance,
    normalX: centerDiffNormalized.x,
    normalY: centerDiffNormalized.y,
    startX: circleB.centerX + centerDiffRadius.x,
    startY: circleB.centerY + centerDiffRadius.y,
  })
}

const createCollisionInfo = ({
  depth = 0,
  normalX = 0,
  normalY = 0,
  startX = 0,
  startY = 0,
  endX = startX + normalX * depth,
  endY = startY + normalY * depth,
}) => {
  return {
    depth,
    startX,
    startY,
    endX,
    endY,
    normalX,
    normalY,
  }
}
