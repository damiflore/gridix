/* eslint-disable operator-assignment */
import { getScalarProduct, scaleVector, normalizeVector } from "./vector.js"
import { testGameObjectBoundingBox } from "./collision/boundingBox.js"
import { getGameObjectCollisionInfo, getOppositeCollisionInfo } from "./collision/collisionInfo.js"
import { moveGameObject, rotateGameObject } from "./gameObject.js"

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

    // position += vitesse * time
    moveGameObject(gameObject, {
      x: gameObject.centerX + gameObject.velocityX * ellapsedSeconds,
      y: gameObject.centerY + gameObject.velocityY * ellapsedSeconds,
    })
    rotateGameObject(gameObject, gameObject.angle + gameObject.velocityAngle * ellapsedSeconds)
  })

  let collisionIterations = 1
  while (collisionIterations--) {
    handleCollision({ gameObjects, drawCollision, context })
  }
}

export const moveAllowedFromMass = (mass) => {
  // object with a negative mass would move to -Infinity
  if (mass < 0) {
    return false
  }

  // object without mass (0) would move to +Infinity
  if (mass === 0) {
    return false
  }

  // object with Infinity mass cannot move -> they tend to 0
  if (mass === Infinity) {
    return false
  }

  return true
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
  const aMass = a.mass
  const bMass = b.mass
  const aMovedAllowedByMass = moveAllowedFromMass(aMass)
  const bMoveAllowedByMass = moveAllowedFromMass(bMass)
  if (!aMovedAllowedByMass && !bMoveAllowedByMass) {
    return
  }

  const aMassInverted = aMovedAllowedByMass ? 1 / aMass : 0
  const bMassInverted = bMoveAllowedByMass ? 1 / bMass : 0
  const massInvertedSum = aMassInverted + bMassInverted

  adjustPositionToSolveCollision(a, b, {
    aMassInverted,
    bMassInverted,
    massInvertedSum,
    collisionInfo,
  })
  applyCollisionImpactOnVelocity(a, b, {
    aMassInverted,
    bMassInverted,
    massInvertedSum,
    collisionInfo,
  })
}

const applyCollisionImpactOnVelocity = (
  a,
  b,
  { aMassInverted, bMassInverted, massInvertedSum, collisionInfo },
) => {
  const aVelocityX = a.velocityX
  const aVelocityY = a.velocityY
  const bVelocityX = b.velocityX
  const bVelocityY = b.velocityY
  const velocityXDiff = bVelocityX - aVelocityX
  const velocityYDiff = bVelocityY - aVelocityY
  const normalX = collisionInfo.normalX
  const normalY = collisionInfo.normalY
  const velocityRelativeToNormal = getScalarProduct(
    { x: velocityXDiff, y: velocityYDiff },
    { x: normalX, y: normalY },
  )
  // if objects moving apart ignore
  if (velocityRelativeToNormal > 0) {
    return
  }

  // normal impulse
  const restitutionForImpact = Math.min(a.restitution, b.restitution)
  const impulseStart = -(1 + restitutionForImpact)
  const normalImpulseScale = (impulseStart * velocityRelativeToNormal) / massInvertedSum
  const normalImpulseX = normalX * normalImpulseScale
  const normalImpulseY = normalY * normalImpulseScale
  const aVelocityXAfterNormalImpulse = aVelocityX - normalImpulseX * aMassInverted
  const aVelocityYAfterNormalImpulse = aVelocityY - normalImpulseY * aMassInverted
  const bVelocityXAfterNormalImpulse = bVelocityX + normalImpulseX * bMassInverted
  const bVelocityYAfterNormalImpulse = bVelocityY + normalImpulseY * bMassInverted

  // tangent impulse
  const tangent = scaleVector(
    normalizeVector({
      x: velocityXDiff - normalX * velocityRelativeToNormal,
      y: velocityYDiff - normalY * velocityRelativeToNormal,
    }),
    -1,
  )
  const velocityRelativeToTangent = getScalarProduct(
    { x: velocityXDiff, y: velocityYDiff },
    tangent,
  )
  const frictionForImpact = Math.min(a.friction, b.friction)
  const tangentImpulseScale = Math.min(
    (impulseStart * velocityRelativeToTangent * frictionForImpact) / massInvertedSum,
    // friction should be less than force in normal direction
    normalImpulseScale,
  )
  const tangentImpulseX = tangent.x * tangentImpulseScale
  const tangentImpulseY = tangent.y * tangentImpulseScale
  const aVelocityXAfterTangentImpulse =
    aVelocityXAfterNormalImpulse - tangentImpulseX * aMassInverted
  const aVelocityYAfterTangentImpulse =
    aVelocityYAfterNormalImpulse - tangentImpulseY * aMassInverted
  const bVelocityXAfterTangentImpulse =
    bVelocityXAfterNormalImpulse + tangentImpulseX * bMassInverted
  const bVelocityYAfterTangentImpulse =
    bVelocityYAfterNormalImpulse + tangentImpulseY * bMassInverted

  a.velocityX = aVelocityXAfterTangentImpulse
  a.velocityY = aVelocityYAfterTangentImpulse
  b.velocityX = bVelocityXAfterTangentImpulse
  b.velocityY = bVelocityYAfterTangentImpulse
}

const adjustPositionToSolveCollision = (
  a,
  b,
  { aMassInverted, bMassInverted, massInvertedSum, collisionInfo },
) => {
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
    return testGameObjectBoundingBox(blocA, blocB)
  })
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
