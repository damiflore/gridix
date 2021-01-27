/* eslint-disable operator-assignment */
import { PHYSIC_CONSTANTS } from "./physic.constants.js"
import { limitNumberPrecision } from "../math/limitNumberPrecision.js"

const limitVelocityPrecision = limitNumberPrecision(4)

export const handleMovement = ({
  gameObjects,
  ellapsedSeconds,
  // when sleep is enabled, if object velocity x, y, and angle is too small
  // according to sleepVelocityCeil and sleepVelocityAngleCeil
  // during more then sleepFrameFloor object becomes sleeping
  // when sleeping object collision are not checked and position is not updated.
  // only a velocity update can awake that object, happens when:
  // - an other moving object collides it (and update its velocity)
  // - something else mutates the object velocity
  sleepEnabled = true,
  sleepVelocityCeil = 0.1,
  sleepVelocityAngleCeil = 0.01,
  sleepFrameFloor = 5,
}) => {
  gameObjects.forEach((gameObject) => {
    if (!gameObject.rigid) {
      return
    }

    const moveAllowedByMass = moveAllowedFromMass(gameObject.mass)

    if (!moveAllowedByMass) {
      return
    }

    const forceX = gameObject.forceX + PHYSIC_CONSTANTS.forceXAmbient
    const forceY = gameObject.forceY + PHYSIC_CONSTANTS.forceYAmbient
    const forceAngle = gameObject.forceAngle + PHYSIC_CONSTANTS.forceAngleAmbient
    // forces are punctual by default
    // if there is a constant force dragging object to the bottom (gravity)
    // it must be reapplied every update
    // this can be implement doing PHYSIC_CONSTANTS.forceYAmbient = 20
    gameObject.forceX = 0
    gameObject.forceY = 0
    gameObject.forceAngle = 0

    const velocityX = gameObject.velocityX
    const velocityY = gameObject.velocityY
    const velocityAngle = gameObject.velocityAngle
    const frictionAmbientCoef = 1 - gameObject.frictionAmbient
    const velocityXAfterApplicationOfForces = limitVelocityPrecision(
      (velocityX + forceX * ellapsedSeconds) * frictionAmbientCoef,
    )
    const velocityYAfterApplicationOfForces = limitVelocityPrecision(
      (velocityY + forceY * ellapsedSeconds) * frictionAmbientCoef,
    )
    const velocityAngleAfterApplicationOfForces = limitVelocityPrecision(
      (velocityAngle + forceAngle * ellapsedSeconds) * frictionAmbientCoef,
    )

    // update velocity
    gameObject.velocityX = velocityXAfterApplicationOfForces
    gameObject.velocityY = velocityYAfterApplicationOfForces
    gameObject.velocityAngle = velocityAngleAfterApplicationOfForces

    if (sleepEnabled && moveAllowedByMass) {
      const sleeping = updateSleepingState(gameObject, {
        sleepVelocityAngleCeil,
        sleepVelocityCeil,
        sleepFrameFloor,
      })
      if (sleeping) {
        return
      }
    }

    // update position
    gameObject.centerX = gameObject.centerX + velocityXAfterApplicationOfForces * ellapsedSeconds
    gameObject.centerY = gameObject.centerY + velocityYAfterApplicationOfForces * ellapsedSeconds
    gameObject.angle = gameObject.angle + velocityAngleAfterApplicationOfForces * ellapsedSeconds
  })
}

const updateSleepingState = (
  gameObject,
  { sleepVelocityAngleCeil, sleepVelocityCeil, sleepFrameFloor },
) => {
  const { velocityX, velocityY, velocityAngle, sleeping } = gameObject
  const shouldSleepFromVelocity =
    velocityAngle * velocityAngle < sleepVelocityAngleCeil &&
    velocityX * velocityX + velocityY * velocityY < sleepVelocityCeil

  if (shouldSleepFromVelocity) {
    // increment number of frame where object is sleeping
    gameObject.sleepingFrameCount++
  }

  // awake
  if (sleeping && !shouldSleepFromVelocity) {
    gameObject.sleeping = false
    gameObject.sleepingFrameCount = 0
    return false
  }

  // puts asleep
  if (!sleeping && shouldSleepFromVelocity && gameObject.sleepingFrameCount > sleepFrameFloor) {
    gameObject.sleeping = true
    return true
  }

  return sleeping
}

export const updateGameObjectPosition = (
  gameObject,
  { x = gameObject.centerX, y = gameObject.centerY, angle = gameObject.angle },
) => {
  gameObject.centerX = x
  gameObject.centerY = y
  gameObject.angle = angle
}

export const updateGameObjectVelocity = (
  gameObject,
  { x = gameObject.velocityX, y = gameObject.velocityY, angle = gameObject.velocityAngle },
) => {
  if (moveAllowedFromMass(gameObject.mass)) {
    gameObject.velocityX = x
    gameObject.velocityY = y
    gameObject.velocityAngle = angle
  }
}

export const updateGameObjectForce = (
  gameObject,
  { x = gameObject.forceX, y = gameObject.forceY, angle = gameObject.forceAngle },
) => {
  gameObject.forceX = x
  gameObject.forceY = y
  gameObject.forceAngle = angle
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
