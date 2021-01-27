import { handleMovement } from "./physic.movement.js"
import { handleCollision } from "./physic.collision.js"

export const updatePhysicForArcadeGame = ({ gameObjects, ellapsedSeconds, collisionCallback }) => {
  handleMovement({ gameObjects, ellapsedSeconds })
  handleCollision({ gameObjects, collisionCallback })
}
