import {
  getScalarProduct,
  scaleVector,
  normalizeVector,
  getVectorialProduct,
} from "../geometry/vector.js"
import { getCollisionInfo } from "../collision/collisionInfo.js"
import {
  moveAllowedFromMass,
  updateGameObjectVelocity,
  updateGameObjectPosition,
} from "./physic.movement.js"

export const handleCollision = ({ gameObjects, drawCollision, context }) => {
  let collisionIterations = 1
  while (collisionIterations--) {
    iterateOnCollision({
      gameObjects,
      drawCollision,
      context,
    })
  }
}

const iterateOnCollision = ({ gameObjects, drawCollision, context }) => {
  forEachPairs(gameObjects, (a, b) => {
    const collisionInfo = getCollisionInfo(a, b)
    if (!collisionInfo) {
      return
    }

    if (drawCollision) {
      drawCollisionInfo(collisionInfo, context)
    }
    resolveCollision(a, b, collisionInfo)
  })
}

const forEachPairs = (array, callback) => {
  let i = 0
  while (i < array.length) {
    const value = array[i]
    i++
    let j = i
    while (j < array.length) {
      const otherValue = array[j]
      j++
      callback(value, otherValue)
    }
  }
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

const adjustPositionToSolveCollision = (
  a,
  b,
  { aMassInverted, bMassInverted, massInvertedSum, collisionInfo },
) => {
  const { collisionDepth, collisionNormalX, collisionNormalY } = collisionInfo
  const correctionRatio = 1
  const correctionTotal = collisionDepth / massInvertedSum
  const correction = correctionTotal * correctionRatio
  const aPositionXCorrection = a.centerX + collisionNormalX * correction * aMassInverted * -1
  const aPositionYCorrection = a.centerY + collisionNormalY * correction * aMassInverted * -1
  updateGameObjectPosition(a, {
    x: aPositionXCorrection,
    y: aPositionYCorrection,
  })
  const bPositionXCorrection = b.centerX + collisionNormalX * correction * bMassInverted
  const bPositionYCorrection = b.centerY + collisionNormalY * correction * bMassInverted
  updateGameObjectPosition(b, {
    x: bPositionXCorrection,
    y: bPositionYCorrection,
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

  const {
    collisionNormalX,
    collisionNormalY,
    collisionStartX,
    collisionStartY,
    collisionEndX,
    collisionEndY,
  } = collisionInfo
  const collisionNormal = {
    x: collisionNormalX,
    y: collisionNormalY,
  }

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
  const velocityRelativeToNormal = getScalarProduct(
    { x: velocityXDiff, y: velocityYDiff },
    collisionNormal,
  )
  // if objects moving apart ignore
  if (velocityRelativeToNormal > 0) {
    return
  }

  const aInertia = inertiaFromGameObject(a)
  const bInertia = inertiaFromGameObject(b)

  // normal impulse
  const restitutionForImpact = Math.min(a.restitution, b.restitution)
  const aCollisionNormalProduct = getVectorialProduct(aCollisionCenterDiff, collisionNormal)
  const bCollisionNormalProduct = getVectorialProduct(bCollisionCenterDiff, collisionNormal)
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

  updateGameObjectVelocity(a, {
    x: aVelocityXAfterTangentImpulse,
    y: aVelocityYAfterTangentImpulse,
    angle: aVelocityAngleAfterTangentImpulse,
  })
  updateGameObjectVelocity(b, {
    x: bVelocityXAfterTangentImpulse,
    y: bVelocityYAfterTangentImpulse,
    angle: bVelocityAngleAfterTangentImpulse,
  })
}

const drawCollisionInfo = (
  { collisionStartX, collisionStartY, collisionEndX, collisionEndY },
  context,
) => {
  context.beginPath()
  context.moveTo(collisionStartX, collisionStartY)
  context.lineTo(collisionEndX, collisionEndY)
  context.closePath()
  context.strokeStyle = "orange"
  context.stroke()
}
