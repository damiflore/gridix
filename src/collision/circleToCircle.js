import {
  substractVector,
  getVectorLength,
  normalizeVector,
  scaleVector,
} from "../geometry/vector.js"
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
        collisionDepth: radiusSum,
        collisionNormalX: 0,
        collisionNormalY: -1,
        collisionStartX: circleB.centerX,
        collisionStartY: circleB.centerY + circleB.radius,
      })
    }
    return createCollisionInfo({
      collisionDepth: radiusSum,
      collisionNormalX: 0,
      collisionNormalY: -1,
      collisionStartX: circleA.centerX,
      collisionStartY: circleA.centerY + circleA.radius,
    })
  }

  // overlapping and center at different position
  const centerDiffNormalized = normalizeVector(centerDiff)
  const centerDiffInvertedAndNormalized = normalizeVector(scaleVector(centerDiff, -1))
  const centerDiffRadius = scaleVector(centerDiffInvertedAndNormalized, circleB.radius)

  return createCollisionInfo({
    collisionDepth: radiusSum - centerDistance,
    collisionNormalX: centerDiffNormalized.x,
    collisionNormalY: centerDiffNormalized.y,
    collisionStartX: circleB.centerX + centerDiffRadius.x,
    collisionStartY: circleB.centerY + centerDiffRadius.y,
  })
}
