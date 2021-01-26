export const GameObject = {
  name: "anonymous",
  centerX: 0,
  centerY: 0,
  // negative angle -> rotate clockwise
  // positive angle -> rotate counterclockwise
  angle: 0,

  mass: 0,
  friction: 0.8,
  restitution: 0.2,

  moveAllowed: false,
  velocityX: 0,
  velocityY: 0,
  velocityAngle: 0,

  accelerationX: 0,
  accelerationY: 0,
  accelerationAngle: 0,

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
