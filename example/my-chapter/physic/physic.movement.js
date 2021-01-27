import { PHYSIC_CONSTANTS } from "./physic.constants.js"

export const handleMovement = ({ gameObjects, ellapsedSeconds }) => {
  gameObjects.forEach((gameObject) => {
    if (!gameObject.rigid) {
      return
    }

    updateGameObjectForce(gameObject, {
      x: gameObject.forceX + PHYSIC_CONSTANTS.forceXAmbient,
      y: gameObject.forceY + PHYSIC_CONSTANTS.forceYAmbient,
      angle: gameObject.forceAngle + PHYSIC_CONSTANTS.forceAngleAmbient,
    })

    // vitesse += force * time
    const frictionAmbientCoef = 1 - gameObject.frictionAmbient
    updateGameObjectVelocity(gameObject, {
      x: gameObject.velocityX + gameObject.forceX * ellapsedSeconds * frictionAmbientCoef,
      y: gameObject.velocityY + gameObject.forceY * ellapsedSeconds * frictionAmbientCoef,
      angle:
        gameObject.velocityAngle + gameObject.forceAngle * ellapsedSeconds * frictionAmbientCoef,
    })

    // forces are punctual by default
    // if there is a constant force dragging object to the bottom (gravity)
    // it must be reapplied every update
    // this can be implement doing PHYSIC_CONSTANTS.forceYAmbient = 20
    gameObject.forceX = 0
    gameObject.forceY = 0
    gameObject.forceAngle = 0

    // position += vitesse * time
    updateGameObjectPosition(gameObject, {
      x: gameObject.centerX + gameObject.velocityX * ellapsedSeconds,
      y: gameObject.centerY + gameObject.velocityY * ellapsedSeconds,
      angle: gameObject.angle + gameObject.velocityAngle * ellapsedSeconds,
    })
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
  if (moveAllowedFromMass(gameObject.mass)) {
    gameObject.forceX = x
    gameObject.forceY = y
    gameObject.forceAngle = angle
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
