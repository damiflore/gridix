import { PHYSIC_CONSTANTS } from "./physic.constants.js"

export const handleMovement = ({ gameObjects, ellapsedSeconds }) => {
  gameObjects.forEach((gameObject) => {
    updateGameObjectAcceleration(gameObject, {
      x: PHYSIC_CONSTANTS.gravityX,
      y: PHYSIC_CONSTANTS.gravityY,
    })

    // vitesse += acceleration * time
    updateGameObjectVelocity(gameObject, {
      x: gameObject.velocityX + gameObject.accelerationX * ellapsedSeconds,
      y: gameObject.velocityY + gameObject.accelerationY * ellapsedSeconds,
      angle: gameObject.velocityAngle + gameObject.accelerationAngle * ellapsedSeconds,
    })

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
    // gameObject.velocityX = x < PHYSIC_CONSTANTS.pointlessLinearVelocity ? 0 : x
    // gameObject.velocityY = y < PHYSIC_CONSTANTS.pointlessLinearVelocity ? 0 : y
    // gameObject.velocityAngle = angle < PHYSIC_CONSTANTS.pointlessAngularVelocity ? 0 : angle
  }
}

export const updateGameObjectAcceleration = (
  gameObject,
  {
    x = gameObject.accelerationX,
    y = gameObject.accelerationY,
    angle = gameObject.accelerationAngle,
  },
) => {
  if (moveAllowedFromMass(gameObject.mass)) {
    gameObject.accelerationX = x
    gameObject.accelerationY = y
    gameObject.accelerationAngle = angle
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
