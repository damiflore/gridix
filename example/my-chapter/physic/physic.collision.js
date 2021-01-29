import {
  getScalarProduct,
  scaleVector,
  normalizeVector,
  getVectorialProduct,
} from "../geometry/vector.js"
import { forEachCollidingPairs } from "../collision/collision.js"
import { motionAllowedFromMass } from "./physic.motion.js"

const positionResolutionCoef = 1

export const handleCollision = ({
  gameObjects,
  collisionCallback,
  collisionPositionResolution,
  collisionVelocityImpact, // could be renamed collisionImpulse
}) => {
  let collisionIterations = 5
  while (collisionIterations--) {
    forEachCollidingPairs({
      gameObjects,
      // iterate only on rigid
      // non static, non sleeping pairs
      canCollidePredicate: (a, b) => {
        if (!a.rigid || !b.rigid) {
          return false
        }

        const aIsStatic = a.sleeping || !motionAllowedFromMass(a.mass)
        const bIsStatic = b.sleeping || !motionAllowedFromMass(b.mass)
        if (aIsStatic && bIsStatic) {
          return false
        }

        return true
      },
      pairCollisionCallback: (a, b, collisionInfo) => {
        collisionCallback({
          a,
          b,
          collisionInfo,
        })
        resolveCollision({
          a,
          b,
          collisionInfo,
          collisionPositionResolution,
          collisionVelocityImpact,
        })
      },
    })
  }
}

const resolveCollision = ({
  a,
  b,
  collisionInfo,
  collisionPositionResolution,
  collisionVelocityImpact,
}) => {
  const aMass = a.mass
  const bMass = b.mass
  const aMotionAllowedByMass = motionAllowedFromMass(aMass)
  const bMotionAllowedByMass = motionAllowedFromMass(bMass)
  const aMassInverted = aMotionAllowedByMass ? 1 / aMass : 0
  const bMassInverted = bMotionAllowedByMass ? 1 / bMass : 0
  const massInvertedSum = aMassInverted + bMassInverted
  if (a.debugCollisionResolution || b.debugCollisionResolution) {
    a.debugCollisionResolution = false
    b.debugCollisionResolution = false
    // eslint-disable-next-line no-debugger
    debugger
  }
  if (collisionPositionResolution) {
    adjustPositionToSolveCollision(a, b, {
      aMassInverted,
      bMassInverted,
      massInvertedSum,
      collisionInfo,
    })
  }
  if (collisionVelocityImpact) {
    applyCollisionImpactOnVelocity(a, b, {
      aMassInverted,
      bMassInverted,
      massInvertedSum,
      collisionInfo,
    })
  }
}

const adjustPositionToSolveCollision = (
  a,
  b,
  { aMassInverted, bMassInverted, massInvertedSum, collisionInfo },
) => {
  const { collisionDepth, collisionNormalX, collisionNormalY } = collisionInfo
  const correctionTotal = collisionDepth / massInvertedSum
  const correction = correctionTotal * positionResolutionCoef
  const aPositionXCorrection = a.centerX + collisionNormalX * correction * aMassInverted * -1
  const aPositionYCorrection = a.centerY + collisionNormalY * correction * aMassInverted * -1
  a.centerX = aPositionXCorrection
  a.centerY = aPositionYCorrection

  const bPositionXCorrection = b.centerX + collisionNormalX * correction * bMassInverted
  const bPositionYCorrection = b.centerY + collisionNormalY * correction * bMassInverted
  b.centerX = bPositionXCorrection
  b.centerY = bPositionYCorrection
}

// min relative velocity between bodies to trigge the velocity impact
const bounceThreshold = 1

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
  // not enough velocity to trigger the bounce
  if (-velocityRelativeToNormal < bounceThreshold) {
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

  a.velocityX = aVelocityXAfterTangentImpulse
  a.velocityY = aVelocityYAfterTangentImpulse
  a.velocityAngle = aVelocityAngleAfterTangentImpulse

  b.velocityX = bVelocityXAfterTangentImpulse
  b.velocityY = bVelocityYAfterTangentImpulse
  b.velocityAngle = bVelocityAngleAfterTangentImpulse
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
  if (!motionAllowedFromMass(mass)) {
    return 0
  }

  const area = radius * radius
  const massTotal = mass * area
  return massTotal * inertiaCoef
}

const rectangleToInertia = ({ mass, width, height, inertiaCoef }) => {
  if (!motionAllowedFromMass(mass)) {
    return 0
  }

  const area = width * width + height * height
  const massTotal = mass * area
  return 1 / (massTotal * inertiaCoef)
}
