/* eslint-disable operator-assignment */
import { getScalarProduct, scaleVector, normalizeVector, getVectorialProduct } from "./vector.js"
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
    if (!moveAllowedFromMass(gameObject.mass)) {
      return
    }

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

const inertiaFromGameObject = (gameObject) => {
  if (gameObject.shape === "circle") {
    return circleToInertia(gameObject)
  }

  if (gameObject.shape === "rectangle") {
    return rectangleToInertia(gameObject)
  }

  return 0
}

const circleToInertia = ({ mass, radius, inertiaCoef }) => {
  if (!moveAllowedFromMass(mass)) {
    return 0
  }

  const area = radius * radius
  const massTotal = mass * area
  return massTotal * inertiaCoef
}

const rectangleToInertia = ({ mass, width, height, inertiaCoef }) => {
  if (!moveAllowedFromMass(mass)) {
    return 0
  }

  const area = width * width + height * height
  const massTotal = mass * area
  return 1 / (massTotal * inertiaCoef)
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
  const aVelocityAngle = a.velocityAngle
  const bVelocityAngle = b.velocityAngle

  // TODO: rename collisionInfo property like this
  // (startX -> collisionStartX)
  const collisionNormalX = collisionInfo.normalX
  const collisionNormalY = collisionInfo.normalY
  const normal = {
    x: collisionNormalX,
    y: collisionNormalY,
  }
  const collisionStartX = collisionInfo.startX
  const collisionStartY = collisionInfo.startY
  const collisionEndX = collisionInfo.endX
  const collisionEndY = collisionInfo.endY

  // angular impulse
  const massStartScale = bMassInverted / massInvertedSum
  const massEndScale = aMassInverted / massInvertedSum
  const collisionStartXScaledWithMass = collisionStartX * massStartScale
  const collisionStartYScaledWithMass = collisionStartY * massStartScale
  const collisionEndXScaledWithMass = collisionEndX * massEndScale
  const collisionEndYScaledWithMass = collisionEndY * massEndScale
  const collisionXScaledSum = collisionStartXScaledWithMass + collisionEndXScaledWithMass
  const collisionYScaledSum = collisionStartYScaledWithMass + collisionEndYScaledWithMass
  const aCollisionCenterDiff = {
    x: collisionXScaledSum - a.centerX,
    y: collisionYScaledSum - a.centerY,
  }
  const bCollisionCenterDiff = {
    x: collisionXScaledSum - b.centerX,
    y: collisionYScaledSum - b.centerY,
  }

  const aVelocityXAfterAngularImpulse = aVelocityX + -1 * aVelocityAngle * aCollisionCenterDiff.y
  const aVelocityYAfterAngularImpulse = aVelocityY + aVelocityAngle * aCollisionCenterDiff.x
  const bVelocityXAfterAngularImpulse = bVelocityX + -1 * bVelocityAngle * bCollisionCenterDiff.y
  const bVelocityYAfterAngularImpulse = bVelocityY + bVelocityAngle * bCollisionCenterDiff.x
  const velocityXDiff = bVelocityXAfterAngularImpulse - aVelocityXAfterAngularImpulse
  const velocityYDiff = bVelocityYAfterAngularImpulse - aVelocityYAfterAngularImpulse
  const velocityRelativeToNormal = getScalarProduct({ x: velocityXDiff, y: velocityYDiff }, normal)
  // if objects moving apart ignore
  if (velocityRelativeToNormal > 0) {
    return
  }

  const aInertia = inertiaFromGameObject(a)
  const bInertia = inertiaFromGameObject(b)

  // normal impulse
  const restitutionForImpact = Math.min(a.restitution, b.restitution)
  const aCollisionNormalProduct = getVectorialProduct(aCollisionCenterDiff, normal)
  const bCollisionNormalProduct = getVectorialProduct(bCollisionCenterDiff, normal)
  const impulseStart = -(1 + restitutionForImpact)
  const normalImpulseDivider =
    massInvertedSum +
    aCollisionNormalProduct * aCollisionNormalProduct * aInertia +
    bCollisionNormalProduct * bCollisionNormalProduct * bInertia
  const normalImpulseScale = (impulseStart * velocityRelativeToNormal) / normalImpulseDivider
  const normalImpulseX = collisionNormalX * normalImpulseScale
  const normalImpulseY = collisionNormalY * normalImpulseScale
  const aVelocityXAfterNormalImpulse = aVelocityX - normalImpulseX * aMassInverted
  const aVelocityYAfterNormalImpulse = aVelocityY - normalImpulseY * aMassInverted
  const bVelocityXAfterNormalImpulse = bVelocityX + normalImpulseX * bMassInverted
  const bVelocityYAfterNormalImpulse = bVelocityY + normalImpulseY * bMassInverted
  const aVelocityAngleAfterNormalImpulse =
    aVelocityAngle - aCollisionNormalProduct * normalImpulseScale * aInertia
  const bVelocityAngleAfterNormalImpulse =
    bVelocityAngle + bCollisionNormalProduct * normalImpulseScale * bInertia

  // tangent impulse
  const tangent = scaleVector(
    normalizeVector({
      x: velocityXDiff - collisionNormalX * velocityRelativeToNormal,
      y: velocityYDiff - collisionNormalY * velocityRelativeToNormal,
    }),
    -1,
  )
  const velocityRelativeToTangent = getScalarProduct(
    { x: velocityXDiff, y: velocityYDiff },
    tangent,
  )
  const aCollisionTangentProduct = getVectorialProduct(aCollisionCenterDiff, tangent)
  const bCollisionTangentProduct = getVectorialProduct(bCollisionCenterDiff, tangent)
  const tangentImpulseDivider =
    massInvertedSum +
    aCollisionTangentProduct * aCollisionTangentProduct * aInertia +
    bCollisionTangentProduct * bCollisionTangentProduct * bInertia
  const frictionForImpact = Math.min(a.friction, b.friction)
  const tangentImpulseScale = Math.min(
    (impulseStart * velocityRelativeToTangent * frictionForImpact) / tangentImpulseDivider,
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
  const aVelocityAngleAfterTangentImpulse =
    aVelocityAngleAfterNormalImpulse - aCollisionTangentProduct * tangentImpulseScale * aInertia
  const bVelocityAngleAfterTangentImpulse =
    bVelocityAngleAfterNormalImpulse + bCollisionTangentProduct * tangentImpulseScale * bInertia

  a.velocityX = aVelocityXAfterTangentImpulse
  a.velocityY = aVelocityYAfterTangentImpulse
  a.velocityAngle = aVelocityAngleAfterTangentImpulse
  b.velocityX = bVelocityXAfterTangentImpulse
  b.velocityY = bVelocityYAfterTangentImpulse
  b.velocityAngle = bVelocityAngleAfterTangentImpulse
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
