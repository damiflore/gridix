import { createRectangle } from "src/geometry/rectangle.js"
import { createRigidBody } from "src/physic/rigid-body.js"

export const createWorldBounds = ({ worldWidth, worldHeight, worldBoundSize = 32 }) => {
  const left = createWorldBound({
    side: "left",
    centerX: -worldBoundSize / 2,
    centerY: worldHeight / 2,
    width: worldBoundSize,
    height: worldHeight,
  })

  const top = createWorldBound({
    side: "top",
    centerX: worldWidth / 2,
    centerY: -worldBoundSize / 2,
    width: worldWidth + worldBoundSize * 2,
    height: worldBoundSize,
  })

  const right = createWorldBound({
    side: "right",
    centerX: worldWidth + worldBoundSize / 2,
    centerY: worldHeight / 2,
    width: worldBoundSize,
    height: worldHeight,
  })

  const bottom = createWorldBound({
    side: "bottom",
    centerX: worldWidth / 2,
    centerY: worldHeight + worldBoundSize / 2,
    width: worldWidth + worldBoundSize * 2,
    height: worldBoundSize,
  })

  return {
    left,
    top,
    right,
    bottom,
  }
}

const createWorldBound = ({ side, centerX, centerY, width, height }) => {
  const rectangle = createRectangle({ centerX, centerY, width, height })

  const rigidBody = createRigidBody({
    ...rectangle,
    mass: Infinity,
    restitution: 0,
  })

  const worldBound = {
    ...rigidBody,
    name: `world-bound-${side}`,
  }

  return worldBound
}
