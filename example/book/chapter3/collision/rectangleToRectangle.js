import { rectangleToCorners, rectangleToNormals } from "../rectangle.js"
import { substractVector, getScalarProduct, scaleVector } from "../vector.js"
import { createCollisionInfo } from "./collisionInfo.js"

export const getCollisionInfoForRectangleToRectangle = (rectangleA, rectangleB) => {
  const firstCollisionInfo = findShortestAxisPenetration(rectangleA, rectangleB)
  if (!firstCollisionInfo) {
    return null
  }

  const secondCollisionInfo = findShortestAxisPenetration(rectangleB, rectangleA)
  if (!secondCollisionInfo) {
    return null
  }

  const firstCollisionDepth = firstCollisionInfo.depth
  const secondCollisionDepth = secondCollisionInfo.depth
  if (firstCollisionDepth < secondCollisionDepth) {
    const depthVector = {
      x: firstCollisionInfo.normalX * firstCollisionDepth,
      y: firstCollisionInfo.normalY * firstCollisionDepth,
    }
    return createCollisionInfo({
      depth: firstCollisionDepth,
      normalX: firstCollisionInfo.normalX,
      normalY: firstCollisionInfo.normalY,
      startX: firstCollisionInfo.startX - depthVector.x,
      startY: firstCollisionInfo.startY - depthVector.y,
    })
  }

  return createCollisionInfo({
    depth: secondCollisionDepth,
    normalX: secondCollisionInfo.normalX * -1,
    normalY: secondCollisionInfo.normalY * -1,
    startX: secondCollisionInfo.startX,
    startY: secondCollisionInfo.startY,
  })
}

const findShortestAxisPenetration = (rectangle, otherRectangle) => {
  const normals = rectangleToNormals(rectangle)
  const corners = rectangleToCorners(rectangle)
  const normalKeys = Object.keys(normals)
  const cornerKeys = Object.keys(corners)
  const otherCorners = rectangleToCorners(otherRectangle)

  let bestDistance = Infinity
  let bestSupportPoint
  let bestNormal
  let i = 4
  while (i--) {
    const normal = normals[normalKeys[i]]
    const corner = corners[cornerKeys[i]]
    const normalOpposite = scaleVector(normal, -1)
    const supportPoint = findFarthestSupportPoint(otherCorners, normalOpposite, corner)
    if (!supportPoint) {
      return null
    }

    const { supportPointDistance } = supportPoint
    if (supportPointDistance < bestDistance) {
      bestDistance = supportPointDistance
      bestSupportPoint = supportPoint
      bestNormal = normal
    }
  }

  const bestVector = scaleVector(bestNormal, bestDistance)
  return createCollisionInfo({
    depth: bestDistance,
    normalX: bestNormal.x,
    normalY: bestNormal.y,
    startX: bestSupportPoint.supportPointX + bestVector.x,
    startY: bestSupportPoint.supportPointY + bestVector.y,
  })
}

const findFarthestSupportPoint = (corners, dir, pointOnEdge) => {
  let supportPointDistance = -Infinity
  let supportPointX = null
  let supportPointY = null
  const cornerKeys = Object.keys(corners)
  let i = 4
  while (i--) {
    const corner = corners[cornerKeys[i]]
    const cornerAndPointDiff = substractVector(corner, pointOnEdge)
    const projection = getScalarProduct(cornerAndPointDiff, dir)
    if (projection > 0 && projection > supportPointDistance) {
      supportPointDistance = projection
      supportPointX = corner.x
      supportPointY = corner.y
    }
  }

  if (supportPointX === null) {
    return null
  }

  return {
    supportPointX,
    supportPointY,
    supportPointDistance,
  }
}
