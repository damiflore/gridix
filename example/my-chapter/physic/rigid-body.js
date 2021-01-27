export const RigidBody = {
  name: "anonymous",
  centerX: 0,
  centerY: 0,
  // negative angle -> rotate clockwise
  // positive angle -> rotate counterclockwise
  angle: 0,

  // Object with negavite, 0, or infinite mass cannot move.
  // colliding such object has no impact on the object itself
  // big mass are less impacted by collision with object with smaller mass
  mass: 1,

  // friction is involved into collision resolution
  // this represents a part of the energy lost in the collision
  friction: 0.8,

  // ratio of energy sent back to something colliding into this game object
  // 0: the object absorbs all the energy of the collision
  // 1: object sends back all the energy of the collision
  restitution: 0.2,

  inertiaCoef: 0.08,

  velocityX: 0,
  velocityY: 0,
  velocityAngle: 0,

  forceX: 0,
  forceY: 0,
  forceAngle: 0,

  // hitBox: null,
  boundingBox: "auto",

  updateState: () => {},
}
