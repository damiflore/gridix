import { getScalarProduct, scaleVector, normalizeVector } from "../vector.js"
import { rectangleToCorners, rectangleToNormals } from "../rectangle.js"
import { createCollisionInfo } from "./collisionInfo.js"
import { getVectorLength } from "../../chapter2/vector.js"

export const getCollisionInfoForRectangleToCircle = (rectangle, circle) => {
  const corners = rectangleToCorners(rectangle)
  const normals = rectangleToNormals(rectangle)
  const cornerKeys = Object.keys(corners)
  const normalKeys = Object.keys(normals)
  const circleCenterX = circle.centerX
  const circleCenterY = circle.centerY
  const circleRadius = circle.radius

  let i = 4
  let inside = true
  let bestDistance = -Infinity
  let nearestCorner
  let nearestNormal
  // find the nearest face for center of circle
  while (i--) {
    const corner = corners[cornerKeys[i]]
    const circleAndCornerDiff = {
      x: circleCenterX - corner.x,
      y: circleCenterY - corner.y,
    }
    const normal = normals[normalKeys[i]]
    const projection = getScalarProduct(circleAndCornerDiff, normal)
    if (projection > 0) {
      // if the center of circle is outside of rectangle
      bestDistance = projection
      nearestCorner = corner
      nearestNormal = normal
      inside = false
      break
    }

    if (projection > bestDistance) {
      bestDistance = projection
      nearestCorner = corner
      nearestNormal = normal
    }
  }

  // the center of circle is inside of rectangle
  if (inside) {
    const radiusVector = scaleVector(nearestNormal, circleRadius)
    return createCollisionInfo({
      depth: circleRadius - bestDistance,
      normalX: nearestNormal.x,
      normalY: nearestNormal.y,
      startX: circleCenterX - radiusVector.x,
      startY: circleCenterY - radiusVector.y,
    })
  }

  // the center of circle is outside of rectangle
  const circleAndNearestCornerDiff = {
    x: circleCenterX - nearestCorner.x,
    y: circleCenterY - nearestCorner.y,
  }
  const nextCorner = corners[(corners.indexOf(nearestCorner) + 1) % 4]
  const cornersDiff = {
    x: nextCorner.x - nearestCorner.x,
    y: nextCorner.y - nearestCorner.y,
  }
  const nearestScalarProduct = getScalarProduct(circleAndNearestCornerDiff, cornersDiff)
  if (nearestScalarProduct < 0) {
    // the center of circle is in corner region of nearestCorner
    const circleAndNearestCornerDistance = getVectorLength(circleAndNearestCornerDiff)
    // compare the distance with radium to decide collision
    if (circleAndNearestCornerDistance > circleRadius) {
      return null
    }

    const circleAndNearestCornerDiffNormalized = normalizeVector(circleAndNearestCornerDiff)
    const radiusVector = scaleVector(circleAndNearestCornerDiffNormalized, -circleRadius)
    return createCollisionInfo({
      depth: circleRadius - circleAndNearestCornerDistance,
      normalX: circleAndNearestCornerDiffNormalized.x,
      normalY: circleAndNearestCornerDiffNormalized.y,
      startX: circleCenterX + radiusVector.x,
      startY: circleCenterY + radiusVector.y,
    })
  }

  // the center of circle is in corner region of mVertex[nearestEdge+1]
  const circleAndNextCornerDiff = {
    x: circleCenterX - nextCorner.x,
    y: circleCenterY - nextCorner.y,
  }
  const cornersDiffInverted = scaleVector(cornersDiff, -1)
  const nextScalarProduct = getScalarProduct(circleAndNextCornerDiff, cornersDiffInverted)
  if (nextScalarProduct < 0) {
    const circleAndNextCornerDistance = getVectorLength(circleAndNextCornerDiff)
    // compare the distance with radium to decide collision
    if (circleAndNextCornerDistance > circleRadius) {
      return null
    }

    const circleAndNextCornerDiffNormalized = normalizeVector(circleAndNextCornerDiff)
    const radiusVector = scaleVector(circleAndNextCornerDiffNormalized, -circleRadius)
    return createCollisionInfo({
      depth: circleRadius - circleAndNextCornerDistance,
      normalX: circleAndNextCornerDiffNormalized.x,
      normalY: circleAndNextCornerDiffNormalized.y,
      startX: circleCenterX + radiusVector.x,
      startY: circleCenterY + radiusVector.y,
    })
  }

  // the center of circle is in face region of face[nearestEdge]
  if (bestDistance < circleRadius) {
    const radiusVector = scaleVector(nearestNormal, circleRadius)
    return createCollisionInfo({
      depth: circleRadius - bestDistance,
      normalX: nearestNormal.x,
      normalY: nearestNormal.y,
      startX: circleCenterX - radiusVector.x,
      startY: circleCenterY - radiusVector.y,
    })
  }

  return null
}
