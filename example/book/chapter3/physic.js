import { substractVector, getScalarProduct, getVectorLength } from "./vector.js"
import { getGameObjectCollisionInfo, getOppositeCollisionInfo } from "./collision/collisionInfo.js"

export const updatePhysicForArcadeGame = ({ gameObjects, context, drawCollision = true }) => {
  const collidingPairs = detectCollidingPairs(gameObjects)
  gameObjects.forEach((gameObject) => {
    gameObject.collisionInfo = null
  })
  collidingPairs.forEach((collidingPair) => {
    const [a, b] = collidingPair
    let collisionInfo = getGameObjectCollisionInfo(a, b)
    if (!collisionInfo) {
      return
    }

    const collisionNormal = {
      x: collisionInfo.normalX,
      y: collisionInfo.normalY,
    }
    const centerDiff = {
      x: b.centerX - a.centerX,
      y: b.centerY - a.centerY,
    }
    if (getScalarProduct(collisionNormal, centerDiff) < 0) {
      collisionInfo = getOppositeCollisionInfo(collisionInfo)
    }

    a.collisionInfo = collisionInfo
    b.collisionInfo = collisionInfo
    if (drawCollision) {
      drawCollisionInfo(collisionInfo, context)
    }
  })
}

const drawCollisionInfo = (collisionInfo, context) => {
  context.beginPath()
  context.moveTo(collisionInfo.startX, collisionInfo.startY)
  context.lineTo(collisionInfo.endX, collisionInfo.endY)
  context.closePath()
  context.strokeStyle = "orange"
  context.stroke()
}

const detectCollidingPairs = (blocs) => {
  return findPairs(blocs, (blocA, blocB) => {
    return testGameObjectBound(blocA, blocB)
  })
}

const testGameObjectBound = (a, b) => {
  return testCircleBound(a, b)
}

const testCircleBound = (circleA, circleB) => {
  const centerDiff = substractVector(
    { x: circleA.centerX, y: circleA.centerY },
    { x: circleB.centerX, y: circleB.centerY },
  )
  const centerDistance = getVectorLength(centerDiff)
  const radiusSum = circleA.boundRadius + circleB.boundRadius

  if (centerDistance > radiusSum) {
    return false
  }

  return true
}

const findPairs = (array, pairPredicate) => {
  const pairs = []

  let i = 0
  while (i < array.length) {
    const value = array[i]
    i++
    let j = i
    while (j < array.length) {
      const otherValue = array[j]
      j++
      if (pairPredicate(value, otherValue)) {
        pairs.push([value, otherValue])
      }
    }
  }

  return pairs
}
