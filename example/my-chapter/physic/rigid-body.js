export const RigidBody = {
  rigid: true,
  sleeping: false,
  lastNotableMoveTime: 0,
  centerXPrev: undefined,
  centerYPrev: undefined,
  anglePrev: undefined,
  debugCollisionResolution: false,
  debugCollisionDetection: false,

  centerX: 0,
  centerY: 0,
  // negative angle -> rotate clockwise
  // positive angle -> rotate counterclockwise
  angle: 0,
  angleLocked: false,

  // Object with negavite, 0, or infinite mass cannot move.
  // colliding such object has no impact on the object itself
  // big mass are less impacted by collision with object with smaller mass
  mass: 1,

  // friction is involved into collision resolution
  // this represents a part of the energy lost in the collision
  friction: 0.8,

  // reistance of the environment to the object moving
  // just like air, water oppose slows down/speed up a movement
  // (depending the direction of the wind etc)
  frictionAmbient: 0.02,

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
}
