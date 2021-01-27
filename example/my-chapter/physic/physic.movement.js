/* eslint-disable operator-assignment */
import { PHYSIC_CONSTANTS } from "./physic.constants.js"
import { limitNumberPrecision } from "../math/limitNumberPrecision.js"

const limitVelocityPrecision = limitNumberPrecision(4)

export const handleMovement = ({ gameObjects, secondsPerFrame, moveCallback }) => {
  gameObjects.forEach((gameObject) => {
    if (!gameObject.rigid) {
      return
    }

    const moveAllowedByMass = moveAllowedFromMass(gameObject.mass)
    if (!moveAllowedByMass) {
      return
    }

    if (gameObject.sleeping) {
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
      (velocityX + forceX * secondsPerFrame) * frictionAmbientCoef,
    )
    const velocityYAfterApplicationOfForces = limitVelocityPrecision(
      (velocityY + forceY * secondsPerFrame) * frictionAmbientCoef,
    )
    const velocityAngleAfterApplicationOfForces = limitVelocityPrecision(
      (velocityAngle + forceAngle * secondsPerFrame) * frictionAmbientCoef,
    )

    // update velocity
    gameObject.velocityX = velocityXAfterApplicationOfForces
    gameObject.velocityY = velocityYAfterApplicationOfForces
    gameObject.velocityAngle = velocityAngleAfterApplicationOfForces

    const centerX = gameObject.centerX
    const centerXAfterApplicationOfVelocity =
      centerX + velocityXAfterApplicationOfForces * secondsPerFrame
    const centerY = gameObject.centerY
    const centerYAfterApplicationOfVelocity =
      centerY + velocityYAfterApplicationOfForces * secondsPerFrame
    const angle = gameObject.angle
    const angleAfterApplicationOfVelocity =
      angle + velocityAngleAfterApplicationOfForces * secondsPerFrame

    if (
      centerX !== centerXAfterApplicationOfVelocity ||
      centerY !== centerYAfterApplicationOfVelocity ||
      angle !== angleAfterApplicationOfVelocity
    ) {
      gameObject.centerX = centerXAfterApplicationOfVelocity
      gameObject.centerY = centerYAfterApplicationOfVelocity
      gameObject.angle = angleAfterApplicationOfVelocity

      moveCallback(
        gameObject,
        {
          centerX,
          centerY,
          angle,
        },
        {
          centerX: centerXAfterApplicationOfVelocity,
          centerY: centerYAfterApplicationOfVelocity,
          angle: angleAfterApplicationOfVelocity,
        },
      )
    }
  })
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
