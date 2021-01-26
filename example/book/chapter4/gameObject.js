export const GameObject = {
  name: "anonymous",
  centerX: 0,
  centerY: 0,
  angle: 0,
  boundRadius: 0,
  collisionInfo: null,
  updateState: () => {},

  // boundingbox: null // will be used to approximate collision (null or a circle)
  // hitbox: null // will be used to detect collision (null, or circle or rectangle)
}

export const moveGameObject = (gameObject, { x = gameObject.centerX, y = gameObject.centerY }) => {
  gameObject.centerX = x
  gameObject.centerY = y
}

export const rotateGameObject = (gameObject, angle) => {
  gameObject.angle = angle
}
