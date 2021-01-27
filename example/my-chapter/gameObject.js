export const GameObject = {
  name: "anonymous",
  centerX: 0,
  centerY: 0,
  // negative angle -> rotate clockwise
  // positive angle -> rotate counterclockwise
  angle: 0,

  mass: 1,
  friction: 0.8,
  restitution: 0.2,
  // 0 means object has no inertia
  // 1 means object has full inertia (mass * area is considered to slow down a movement)
  inertiaCoef: 0.08,

  velocityX: 0,
  velocityY: 0,
  velocityAngle: 0,

  forceX: 0,
  forceY: 0,
  forceAngle: 0,

  boundingBox: "auto",
  // ideally a game object would have a hitBox that could be different
  // from the object dimension. In practice, I don't need that for now
  // If we want to do that, the hitBox coordinates should be updated every time
  // the object is moved, following also eventual angle (rotation)
  collisionInfo: null,
  updateState: () => {},
}
