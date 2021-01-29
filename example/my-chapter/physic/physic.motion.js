/* eslint-disable operator-assignment */
// import { PHYSIC_CONSTANTS } from "./physic.constants.js"
// import { limitNumberPrecision } from "../math/limitNumberPrecision.js"

// const limitVelocityPrecision = limitNumberPrecision(4)

export const handleMotion = ({ gameObjects, timePerFrame, moveCallback }) => {
  gameObjects.forEach((gameObject) => {
    if (!gameObject.rigid) {
      return
    }

    const velocityX = gameObject.velocityX
    const velocityY = gameObject.velocityY
    const velocityAngle = gameObject.velocityAngle
    // I think force should be an array
    // so that many forces can be applied to a gameObject
    // and once we have applied all the forces we know where that object is going
    const forceX = gameObject.forceX
    const forceY = gameObject.forceY
    const forceAngle = gameObject.forceAngle
    const motionAllowedByMass = motionAllowedFromMass(gameObject.mass)
    if (!motionAllowedByMass) {
      if (velocityX || velocityY || velocityAngle || forceX || forceY || forceAngle) {
        if (import.meta.dev) {
          console.warn(
            `found forces on object unable of motion, all force and velocity forced to zero`,
          )
        }
        gameObject.velocityX = gameObject.velocityY = gameObject.velocityAngle = 0
        gameObject.forceX = gameObject.forceY = gameObject.forceAngle = 0
      }
      return
    }

    if (gameObject.sleeping) {
      return
    }

    // forces are punctual by default
    // if there is a constant force dragging object to the bottom (gravity)
    // it must be reapplied every update
    // this can be implement doing PHYSIC_CONSTANTS.forceYAmbient = 20
    gameObject.forceX = 0
    gameObject.forceY = 0
    gameObject.forceAngle = 0

    const frictionAmbientCoef = 1 - gameObject.frictionAmbient
    const velocityXAfterApplicationOfForces =
      (velocityX + forceX * timePerFrame) * frictionAmbientCoef
    const velocityYAfterApplicationOfForces =
      (velocityY + forceY * timePerFrame) * frictionAmbientCoef
    const velocityAngleAfterApplicationOfForces = gameObject.angleLocked
      ? 0
      : (velocityAngle + forceAngle * timePerFrame) * frictionAmbientCoef

    // update velocity
    gameObject.velocityX = velocityXAfterApplicationOfForces
    gameObject.velocityY = velocityYAfterApplicationOfForces
    gameObject.velocityAngle = velocityAngleAfterApplicationOfForces

    const centerX = gameObject.centerX
    const centerXAfterApplicationOfVelocity =
      centerX + velocityXAfterApplicationOfForces * timePerFrame
    const centerY = gameObject.centerY
    const centerYAfterApplicationOfVelocity =
      centerY + velocityYAfterApplicationOfForces * timePerFrame
    const angle = gameObject.angle
    const angleAfterApplicationOfVelocity =
      angle + velocityAngleAfterApplicationOfForces * timePerFrame

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
  gameObject.velocityX = x
  gameObject.velocityY = y
  gameObject.velocityAngle = angle
}

export const updateGameObjectForce = (
  gameObject,
  { x = gameObject.forceX, y = gameObject.forceY, angle = gameObject.forceAngle },
) => {
  gameObject.forceX = x
  gameObject.forceY = y
  gameObject.forceAngle = angle
}

export const motionAllowedFromMass = (mass) => {
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
