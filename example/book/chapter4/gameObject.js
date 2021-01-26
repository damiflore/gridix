export const GameObject = {
  name: "anonymous",
  centerX: 0,
  centerY: 0,
  angle: 0,
  boundingCircleRadius: undefined,
  collisionInfo: null,
  updateState: () => {},
}

export const moveGameObject = (gameObject, { x = gameObject.centerX, y = gameObject.centerY }) => {
  gameObject.centerX = x
  gameObject.centerY = y
}

export const rotateGameObject = (gameObject, angle) => {
  gameObject.angle = angle
}
