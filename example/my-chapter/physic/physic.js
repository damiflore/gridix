import { handleMovement } from "./physic.movement.js"
import { handleCollision } from "./physic.collision.js"

export const updatePhysicForArcadeGame = ({
  gameObjects,
  ellapsedSeconds,
  drawCollision = true,
  context,
}) => {
  handleMovement({ gameObjects, ellapsedSeconds })
  handleCollision({ gameObjects, drawCollision, context })
}
