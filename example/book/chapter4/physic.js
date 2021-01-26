import { substractVector, getScalarProduct, getVectorLength } from "./vector.js"
import { getGameObjectCollisionInfo, getOppositeCollisionInfo } from "./collision/collisionInfo.js"
import { moveGameObject, rotateGameObject } from "../chapter2/gameObject.js"

export const updatePhysicForArcadeGame = ({
  gameObjects,
  ellapsedSeconds,
  gravityX = 0,
  gravityY = 0,
  drawCollision = true,
  context,
}) => {
  gameObjects.forEach((gameObject) => {
    // gravity
    gameObject.accelerationX = gravityX
    gameObject.accelerationY = gravityY

    // vitesse += acceleration * time
    gameObject.velocityX += gameObject.accelerationX * ellapsedSeconds
    gameObject.velocityY += gameObject.accelerationY * ellapsedSeconds
    gameObject.velocityAngle += gameObject.accelerationAngle * ellapsedSeconds

    // object with an Infinite mass cannot move (static objects)
    if (gameObject.mass !== Infinity) {
      // position += vitesse * time
      moveGameObject(gameObject, {
        x: gameObject.centerX + gameObject.velocityX * ellapsedSeconds,
        y: gameObject.centerY + gameObject.velocityY * ellapsedSeconds,
      })
      rotateGameObject(gameObject, gameObject.angle + gameObject.velocityAngle * ellapsedSeconds)
    }
  })

  let collisionIterations = 1
  while (collisionIterations--) {
    handleCollision({ gameObjects, drawCollision, context })
  }
}

const handleCollision = ({ gameObjects, drawCollision, context }) => {
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
    resolveCollision(a, b, collisionInfo)
  })
}

const resolveCollision = (a, b, collisionInfo) => {
  adjustPositionToSolveCollision(a, b, collisionInfo)
}

const adjustPositionToSolveCollision = (a, b, collisionInfo) => {
  const aMass = a.mass
  const bMass = b.mass
  const aMassInverted = aMass === 0 || aMass === Infinity ? 0 : 1 / aMass
  const bMassInverted = bMass === 0 || bMass === Infinity ? 0 : 1 / bMass
  // cannot move object with Infinity mass
  // and cannot move object without mass (they would move to Infinity)
  if (aMassInverted === 0 && bMassInverted === 0) {
    return
  }

  const massInvertedSum = aMassInverted + bMassInverted
  const correctionRatio = 1
  const correctionTotal = collisionInfo.depth / massInvertedSum
  const correction = correctionTotal * correctionRatio
  const aPositionXCorrection = a.centerX + collisionInfo.normalX * correction * aMassInverted * -1
  const aPositionYCorrection = a.centerY + collisionInfo.normalY * correction * aMassInverted * -1
  moveGameObject(a, {
    x: aPositionXCorrection,
    y: aPositionYCorrection,
  })
  const bPositionXCorrection = b.centerX + collisionInfo.normalX * correction * bMassInverted
  const bPositionYCorrection = b.centerY + collisionInfo.normalY * correction * bMassInverted
  moveGameObject(b, {
    x: bPositionXCorrection,
    y: bPositionYCorrection,
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
