import { substractVector, getVectorLength, normalizeVector, scaleVector } from "../vector.js"
import { createCollisionInfo } from "./collisionInfo.js"

export const getCollisionInfoForCircleToCircle = (circleA, circleB) => {
  const centerDiff = substractVector(
    { x: circleB.centerX, y: circleB.centerY },
    { x: circleA.centerX, y: circleA.centerY },
  )
  const centerDistance = getVectorLength(centerDiff)
  const radiusSum = circleA.radius + circleB.radius

  if (centerDistance > radiusSum) {
    return null
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
