import { substractVector, getScalarProduct, getVectorLength } from "./vector.js"
import { getGameObjectCollisionInfo, getOppositeCollisionInfo } from "./collision/collisionInfo.js"
import { moveGameObject, rotateGameObject } from "../chapter2/gameObject.js"

export const updatePhysicForArcadeGame = ({
  gameObjects,
  ellapsedSeconds,
  gravityX = 0,
  gravityY = 10,
  context,
  drawCollision = true,
}) => {
  gameObjects.forEach((gameObject) => {
    // gravity
    gameObject.accelerationX = gravityX
    gameObject.accelerationY = gravityY

    // vitesse += acceleration * time
    gameObject.velocityX += gameObject.accelerationX * ellapsedSeconds
    gameObject.velocityY += gameObject.accelerationY * ellapsedSeconds
    gameObject.velocityAngular += gameObject.accelerationAngular * ellapsedSeconds

    // position += vitesse * time
    moveGameObject(gameObject, {
      x: gameObject.centerX + gameObject.velocityX * ellapsedSeconds,
      y: gameObject.centerY + gameObject.velocityY * ellapsedSeconds,
    })
    rotateGameObject(gameObject, gameObject.angle + gameObject.velocityAngular * ellapsedSeconds)
  })

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
    return testGameObjectBoundindCircle(blocA, blocB)
  })
}

const testGameObjectBoundindCircle = (a, b) => {
  return testCircleBound(a, b)
}

const gameObjectToBoundingCircleRadius = (gameObject) => {
  const { boundingCircleRadius } = gameObject
  if (typeof boundingCircleRadius === "number") {
    return boundingCircleRadius
  }

  const { shape } = gameObject
  if (shape === "rectangle") {
    const { width, height } = gameObject
    return Math.sqrt(width * width + height * height) / 2
  }

  if (shape === "circle") {
    const { radius } = gameObject
    return radius
  }

  return 0
}

const testCircleBound = (circleA, circleB) => {
  const centerDiff = substractVector(
    { x: circleA.centerX, y: circleA.centerY },
    { x: circleB.centerX, y: circleB.centerY },
  )
  const centerDistance = getVectorLength(centerDiff)
  const circleABoundingRadius = gameObjectToBoundingCircleRadius(circleA)
  const circleBBoundingRadius = gameObjectToBoundingCircleRadius(circleB)
  const radiusSum = circleABoundingRadius + circleBBoundingRadius

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
