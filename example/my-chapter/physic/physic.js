import { handleMovement } from "./physic.movement.js"
import { handleCollision } from "./physic.collision.js"

export const updatePhysicForArcadeGame = ({
  gameObjects,
  ellapsedSeconds,
  movement = true,
  collisionCallback = () => {},
  collisionPositionResolution = true,
  collisionVelocityImpact = true,
}) => {
  if (movement) {
    handleMovement({
      gameObjects,
      ellapsedSeconds,
    })
  }
  handleCollision({
    gameObjects,
    collisionCallback,
    collisionPositionResolution,
    collisionVelocityImpact,
  })
}
